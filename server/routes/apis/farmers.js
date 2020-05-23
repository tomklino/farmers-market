var fs = require('fs');

var express = require('express');
var router = express.Router();
var mongo = require('../../utils/mongo');
var debug = require('debug')('server:farmers');

const db_name         = "farmers";
const collection_name = "farmers";

router.get('/', async function(req, res, next) {
  let mongoClient = mongo.getClient();
  let db = mongoClient.db(db_name);
  payload = await findDocuments(db);
  // payload = JSON.parse(fs.readFileSync("samples/farmers.json", "utf8"));
  res.json(payload);
});

router.post('/new', async function(req, res, next) {
  let mongoClient = mongo.getClient();
  let db = mongoClient.db(db_name);
  let payload = req.body;
  debug("got request for a new farmer");
  let [ validated, violations ] = validateFarmerJSON(payload);
  if(!validated) {
    debug("refusing to add an invalid farmer");
    res.status(400).send("invalid JSON: " + violations);
    return;
  }
  let err = await insertFarmer(payload, db);
  if (err) {
    debug("encountered error while trying to insert farmer", err);
    res.status(500).send("Internal Error");
    return;
  }
  res.send("Done");
});

function validateFarmerJSON(farmerJSON) {
  let rules = {
    name: [
      v => typeof v === 'string' || "name must be a string",
    ],
    packageSize: [
      v => typeof v === 'number' || "packageSize must be a number",
    ],
    packageUnit: [
      v => [ "Kg", "gr" ].includes(v) || "packageUnit must be on of 'Kg', 'gr'",
    ],
    produce: [
      v => typeof v === 'string' || "produce must be a string",
    ],
    orderMinimum: [
      v => typeof v === 'number' || "orderMinimum must be a number",
    ],
    arrivalDates: [
      v => Array.isArray(v) || "arrivalDates must be an array",
      // TODO check valid dates
    ],
    price: [
      v => typeof v === 'number' || "price must be a number",
    ],
    shipmentArea: [
      v => typeof v === 'string' || "shipmentArea must be a string",
    ]
  }

  let violations = [];
  for(let [key, ruleSet] of Object.entries(rules)) {
    for (rule of ruleSet) {
      let outcome = rule(farmerJSON[key]);
      if (typeof outcome === 'string') {
        violations.push(outcome);
      }
    }
  }

  return [ violations.length === 0, violations ];
}

function insertFarmer(farmerJSON, db) {
  return new Promise((resolve) => {
    const collection = db.collection(collection_name);
    collection.insertOne(farmerJSON, (err, r) => {
      debug("farmer inserted successfully", r);
      resolve(err);
    })
  })
}

function findDocuments(db) {
  // Get the documents collection
  return new Promise((resolve) => {
    const collection = db.collection(collection_name);
    // Find some documents
    collection.find({}).toArray((err, docs) => {
      debug("Found the following records");
      debug(docs)
      resolve(docs);
    });
  })
}

module.exports = router;
