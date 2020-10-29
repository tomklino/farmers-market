const debug = require('debug')('data:orders');

const mongo = require('./mongo');
const { ObjectId } = require('mongodb');

const {
  db_name,
  orders_collection_name,
  farmers_collection_name
} = require('./mongo-constants');

module.exports = {
  isOrderComplete,
  completeOrder,
  unCompleteOrder,
  modifyOrder,
  insertOrder,
  findOrder,
  findOrders,
  findOrdersByUser,
  markAsPayed,
  unmarkAsPayed,
  cancelOrder
}

async function cancelOrder(orderID) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) { throw err; }

  return collection.updateOne(
      { _id: ObjectId(orderID) },
      { $set: { "cancelled": "true" }});
}

async function markAsPayed(orderID) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) { throw err; }

  return collection.updateOne(
      { _id: ObjectId(orderID) },
      { $set: { "payed": "true" }});
}

async function unmarkAsPayed(orderID) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) { throw err; }

  return collection.updateOne(
      { _id: ObjectId(orderID) },
      { $set: { "payed": "false" }});
}

async function isOrderComplete(orderID) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) { throw err; }

  const order = await collection.findOne({ _id: new ObjectId(orderID) });
  return order['completed'] === "true";
}

async function completeOrder(orderID) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) { throw err; }

  return collection.updateOne(
      { _id: ObjectId(orderID) },
      { $set: { "completed": "true" }});
}

async function unCompleteOrder(orderID) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) { throw err; }

  return collection.updateOne(
      { _id: ObjectId(orderID) },
      { $set: { "completed": "false" }});
}

async function modifyOrder(orderJSON) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) { throw err; }

  return collection.updateOne(
      { _id: ObjectId(orderJSON.orderID) },
      { $set: orderJSON });
}

async function insertOrder(orderJSON) {
  const [ err, db ] = await mongo.getDB(db_name);
  if(err) {
    return [ err, null ];
  }

  const ordersCollection = db.collection(orders_collection_name);
  const farmersCollection = db.collection(farmers_collection_name);

  try {
    const farmer = await farmersCollection.findOne({ _id: ObjectId(orderJSON['farmerID'])});
    orderJSON.farmerName = farmer.name;
    orderJSON.farmerImage = farmer.image;
  } catch (err) {
    return [ err, null ];
  }

  try {
    const result = await ordersCollection.insertOne(orderJSON)
    debug("order inserted successfully");
    return [ null, result.insertedId ];
  } catch (err) {
    return [ err, null ];
  }
}

async function findOrder(orderID, options) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) { throw err; }

  if(typeof options === 'object' && options.includeCancelled) {
    return collection.findOne({ _id: new ObjectId(orderID) });
  } else {
    return collection.findOne({
      _id: new ObjectId(orderID),
      cancelled: { "$ne": "true" }
    });
  }
}

async function findOrders(farmerID, options) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) { throw err; }

  if(typeof options === 'object' && options.includeCancelled) {
    return collection.find({ farmerID: farmerID }).toArray();
  } else {
    return collection.find({
      farmerID: farmerID,
      cancelled: { "$ne": "true" }
    }).toArray();
  }
}

async function findOrdersByUser(username, options) {
  const [ err, collection ] = await mongo.getCollection(db_name, orders_collection_name);
  if(err) { throw err; }

  if(typeof options === 'object' && options.includeCancelled) {
    return collection.find({ created_by: username }).toArray();
  } else {
    return collection.find({
      created_by: username,
      cancelled: { "$ne": "true" }
    }).toArray();
  }
}
