const debug = require('debug')('data:orders');

const { generateWithCollectionFunction } = require('./mongo');
const { ObjectId } = require('mongodb');
const { getFarmer } = require('./farmers-data');

const {
  db_name,
  orders_collection_name,
  farmers_collection_name
} = require('./mongo-constants');

const withOrdersCollection = generateWithCollectionFunction(db_name, orders_collection_name);

[
  cancelOrder,
  markAsPayed,
  unmarkAsPayed,
  isOrderComplete,
  completeOrder,
  unCompleteOrder,
  modifyOrder,
  insertOrder,
  findOrder,
  findOrders,
  findOrdersByUser
].forEach((f) => {
  module.exports[f.name] = withOrdersCollection(f)
});

async function cancelOrder(collection, orderID) {
  return collection.updateOne(
    { _id: ObjectId(orderID) },
    { $set: { "cancelled": "true" }});
}

async function markAsPayed(collection, orderID) {
  return collection.updateOne(
    { _id: ObjectId(orderID) },
    { $set: { "payed": "true" }});
}

async function unmarkAsPayed(collection, orderID) {
  return collection.updateOne(
    { _id: ObjectId(orderID) },
    { $set: { "payed": "false" }});
}

async function isOrderComplete(collection, orderID) {
  const order = await collection.findOne({ _id: new ObjectId(orderID) });
  return order['completed'] === "true";
}

async function completeOrder(collection, orderID) {
  return collection.updateOne(
    { _id: ObjectId(orderID) },
    { $set: { "completed": "true" }});
}

async function unCompleteOrder(collection, orderID) {
  return collection.updateOne(
    { _id: ObjectId(orderID) },
    { $set: { "completed": "false" }});
}

async function modifyOrder(collection, orderJSON) {
  return collection.updateOne(
    { _id: ObjectId(orderJSON.orderID) },
    { $set: orderJSON });
}

async function insertOrder(collection, orderJSON) {
  try {
    const farmer = await getFarmer(orderJSON['farmerID']);
    orderJSON.farmerName = farmer.name;
    orderJSON.farmerImage = farmer.image;
  } catch (err) {
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

async function findOrder(collection, orderID, options) {
  if(typeof options === 'object' && options.includeCancelled) {
    return collection.findOne({ _id: new ObjectId(orderID) });
  } else {
    return collection.findOne({
      _id: new ObjectId(orderID),
      cancelled: { "$ne": "true" }
    });
  }
}

async function findOrders(collection, farmerID, options) {
  if(typeof options === 'object' && options.includeCancelled) {
    return collection.find({ farmerID: farmerID }).toArray();
  } else {
    return collection.find({
      farmerID: farmerID,
      cancelled: { "$ne": "true" }
    }).toArray();
  }
}

async function findOrdersByUser(collection, username, options) {
  if(typeof options === 'object' && options.includeCancelled) {
    return collection.find({ created_by: username }).toArray();
  } else {
    return collection.find({
      created_by: username,
      cancelled: { "$ne": "true" }
    }).toArray();
  }
}
