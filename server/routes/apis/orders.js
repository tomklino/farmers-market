var fs = require('fs');

var express = require('express');
var router = express.Router();
var mongo = require('../../utils/mongo');
const { ObjectId } = require('mongodb'); // or ObjectID
var debug = require('debug')('server:orders');

const db_name         = "farmers";
const collection_name = "orders";
const farmers_collection_name = "farmers";

router.get('/:farmerID', async function(req, res, next) {
  let mongoClient = await mongo.getClient();
  let db = mongoClient.db(db_name);
  payload = await findDocuments(db, req.params.farmerID);
  res.json(payload);
});

router.get('/byid/:orderID', async function(req, res, next) {
  let mongoClient = await mongo.getClient();
  let db = mongoClient.db(db_name);
  payload = await findOrder(db, req.params.orderID);
  payloadArray = [ payload ];
  debug("orders/byid - response:", payloadArray);
  res.json(payloadArray);
});

router.post('/new', async function(req, res, next) {
  let mongoClient = await mongo.getClient();
  let db = mongoClient.db(db_name);
  let payload = req.body;
  debug("got request for a new order");
  let [ validated, violations ] = await validateOrderJSON(payload);
  if(!validated) {
    debug("refusing to add an invalid order");
    res.status(400).send("invalid JSON: " + violations);
    return;
  }
  let err = await insertOrder(payload, db);
  if (err) {
    debug("encountered error while trying to insert order", err);
    res.status(500).send("Internal Error");
    return;
  }
  res.send("Done");
});

async function validateFarmerID(farmerID) {
  let mongoClient = await mongo.getClient();
  let db = mongoClient.db(db_name);
  let collection = db.collection(farmers_collection_name);
  return new Promise((resolve) => {
    collection.findOne({ _id: farmerID }, (err, doc) => {
      if(err) {
        debug("error while trying to verify farmer")
        resolve(err.toString())
        return;
      }
      resolve(true);
    })
  })
}

async function validateOrderJSON(orderJSON) {
  let rules = {
    name: [
      v => typeof v === 'string' || "name must be a string",
    ],
    phone: [
      v => !!v || "phone must be defined",
      // TODO verify with regex
    ],
    products: [
      v => Array.isArray(v) || "products must be an array",
    ],
    farmerID: [
      validateFarmerID
    ]
  }

  let violations = [];
  for(let [key, ruleSet] of Object.entries(rules)) {
    for (rule of ruleSet) {
      let outcome = await rule(orderJSON[key]);
      if (typeof outcome === 'string') {
        violations.push(outcome);
      }
    }
  }

  return [ violations.length === 0, violations ];
}

function insertOrder(orderJSON, db) {
  return new Promise((resolve) => {
    const collection = db.collection(collection_name);
    collection.insertOne(orderJSON, (err, r) => {
      debug("order inserted successfully", r);
      resolve(err);
    })
  })
}

function findOrder(db, orderID) {
  return new Promise((resolve) => {
    const collection = db.collection(collection_name);
    debug("trying to find order with id", orderID);
    collection.findOne({ _id: new ObjectId(orderID) }, (err, result) => {
      if(err) {
        console.log("error while trying to fetch order", err);
      }
      debug("found the following order", result);
      resolve(result)
    })
  })
}

function findDocuments(db, farmerID) {
  // Get the documents collection
  return new Promise((resolve) => {
    const collection = db.collection(collection_name);
    // Find some documents
    collection.find({ farmerID: farmerID }).toArray((err, docs) => {
      debug("Found the following records");
      debug(docs)
      resolve(docs);
    });
  })
}

module.exports = router;
