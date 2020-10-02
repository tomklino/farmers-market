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
  findOrders,
  findOrdersByUser
}

async function completeOrder(orderID) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) {
    throw err;
  }

  return collection.updateOne(
      { _id: ObjectId(orderID) },
      { $set: { "completed": "true" }});
}

async function unCompleteOrder(orderID) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) {
    throw err;
  }

  return collection.updateOne(
      { _id: ObjectId(orderID) },
      { $set: { "completed": "false" }});
}

async function modifyOrder(orderJSON) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) {
    throw err;
  }

  return collection.updateOne(
      { _id: ObjectId(orderJSON.orderID) },
      { $set: orderJSON });
}

async function insertOrder(orderJSON) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) {
    return [ err, null ];
  }

  try {
    const result = await collection.insertOne(orderJSON)
    debug("order inserted successfully");
    return [ null, result.insertedId ];
  } catch (err) {
    return [ err, null ];
  }
}

async function findOrder(orderID) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) {
    throw err;
  }

  return collection.findOne({ _id: new ObjectId(orderID) });
}

async function findOrders(farmerID) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) {
    throw err;
  }

  return collection.find({ farmerID: farmerID }).toArray();
}

async function findOrdersByUser(username) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) {
    throw err;
  }

  return collection.find({ created_by: username }).toArray();
}
