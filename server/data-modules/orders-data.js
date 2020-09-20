const debug = require('debug')('data:orders');

const mongo = require('./mongo');
const { ObjectId } = require('mongodb');

const {
  db_name,
  orders_collection_name,
  farmers_collection_name
} = require('./mongo-constants');

module.exports = {
  completeOrder,
  unCompleteOrder,
  modifyOrder,
  insertOrder,
  findOrder,
  findOrders
}

async function completeOrder(orderID) {
  const collection = await mongo.getCollection(db_name, orders_collection_name);

  return collection.updateOne(
    { _id: ObjectId(orderID) },
    { $set: { "completed": "true" }}
  );
}

async function unCompleteOrder(orderID) {
  const collection = await mongo.getCollection(db_name, orders_collection_name);

  return collection.updateOne(
    { _id: ObjectId(orderID) },
    { $set: { "completed": "false" }}
  );
}

async function modifyOrder(orderJSON) {
  const collection = await mongo.getCollection(db_name, orders_collection_name);

  return new Promise((resolve) => {
    collection.updateOne(
      { _id: ObjectId(orderJSON.orderID) },
      { $set: orderJSON });
    resolve();
  });
}

async function insertOrder(orderJSON) {
  const collection = await mongo.getCollection(db_name, orders_collection_name);

  return new Promise((resolve) => {
    collection.insertOne(orderJSON, (err, r) => {
      debug("order inserted successfully", r);
      resolve(err);
    });
  });
}

async function findOrder(orderID) {
  const collection = await mongo.getCollection(db_name, orders_collection_name);

  return new Promise((resolve) => {
    debug("trying to find order with id", orderID);
    collection.findOne({ _id: new ObjectId(orderID) }, (err, result) => {
      if(err) {
        console.log("error while trying to fetch order", err);
        return resolve(err);
      }
      debug("found the following order", result);
      resolve(result);
    });
  });
}

async function findOrders(farmerID) {
  const collection = await mongo.getCollection(db_name, orders_collection_name);

  return new Promise((resolve) => {
    collection.find({ farmerID: farmerID }).toArray((err, docs) => {
      debug("Found the following records");
      debug(docs)
      resolve(docs);
    });
  });
}
