const debug = require('debug')('data:farmers');

const mongo = require('./mongo');
const { ObjectId } = require('mongodb');

const {
  db_name,
  orders_collection_name,
  farmers_collection_name
} = require('./mongo-constants');

module.exports = {
  validateFarmerID,
  findFarmers,
  insertFarmer,
  modifyFarmer,
  deleteFarmer,
  getFarmerImage,
  lockFarmerForOrders,
  unlockFarmerForOrders,
  isFarmerLockedForOrders
}

async function isFarmerLockedForOrders(farmerID) {
  const [ err, collection ] = await mongo.getCollection(db_name, farmers_collection_name);
  if(err) { throw err; }

  const farmer = await collection.findOne({ _id: new ObjectId(farmerID) });
  return farmer['orderLock'] === "true";
}

async function lockFarmerForOrders(farmerID) {
  const [ err, collection ] = await mongo.getCollection(db_name, farmers_collection_name);
  if(err) { throw err; }

  return collection.updateOne(
    { _id: new ObjectId(farmerID) },
    { $set: { "orderLock": "true" }}
  );
}

async function unlockFarmerForOrders(farmerID) {
  const [ err, collection ] = await mongo.getCollection(db_name, farmers_collection_name);
  if(err) { throw err; }

  return collection.updateOne(
    { _id: new ObjectId(farmerID) },
    { $set: { "orderLock": "false" }}
  );
}

async function validateFarmerID(farmerID) {
  const [ err, collection ] = await mongo.getCollection(db_name, farmers_collection_name);
  if(err) { throw err; }

  return collection.findOne({ _id: new ObjectId(farmerID) });
}

async function findFarmers() {
  const [ err, collection ] = await mongo.getCollection(db_name, farmers_collection_name);
  if(err) { throw err; }

  return collection.find({}).toArray();
}

async function insertFarmer(farmerJSON) {
  const [ err, collection ] = await mongo.getCollection(db_name, farmers_collection_name);
  if(err) { throw err; }

  return collection.insertOne(farmerJSON);
}

async function modifyFarmer(id, farmerJSON) {
  const [ err, collection ] = await mongo.getCollection(db_name, farmers_collection_name);
  if(err) { throw err; }

  return collection.updateOne(
      { _id: ObjectId(id) },
      { $set: farmerJSON });
}

async function deleteFarmer(id) {
  const [ err, collection ] = await mongo.getCollection(db_name, farmers_collection_name);
  if(err) { throw err; }

  return collection.findOneAndDelete({ _id: new ObjectId(id) });
}

async function getFarmerImage(farmerID) {
  const [ err, collection ] = await mongo.getCollection(db_name, farmers_collection_name);
  if(err) { throw err; }

  try {
    const farmer = await collection.findOne({ _id: new ObjectId(farmerID) });
    return typeof farmer['image'] === 'string' ?
      farmer['image'] :
      new Error("IMAGE URI NOT FOUND");
  } catch (err) {
    throw err;
  }
}
