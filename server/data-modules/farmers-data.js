const debug = require('debug')('data:farmers');

const { generateWithCollectionFunction } = require('./mongo');
const { ObjectId } = require('mongodb');

const {
  db_name,
  farmers_collection_name
} = require('./mongo-constants');

const withFarmersCollection = generateWithCollectionFunction(db_name, farmers_collection_name);

[
  getFarmerOwner,
  getFarmer,
  isFarmerLockedForOrders,
  lockFarmerForOrders,
  unlockFarmerForOrders,
  validateFarmerID,
  findFarmers,
  insertFarmer,
  modifyFarmer,
  deleteFarmer,
  getFarmerImage
].forEach((f) => {
  module.exports[f.name] = withFarmersCollection(f)
});

async function getFarmerOwner(collection, farmerID) {
  const farmer = await collection.findOne({ _id: new ObjectId(farmerID) });
  return farmer.owner;
}

async function getFarmer(collection, farmerID) {
  return await collection.findOne({ _id: new ObjectId(farmerID) });
}

async function isFarmerLockedForOrders(collection, farmerID) {
  const farmer = await collection.findOne({ _id: new ObjectId(farmerID) });
  return farmer['orderLock'] === "true";
}

async function lockFarmerForOrders(collection, farmerID) {
  return collection.updateOne(
    { _id: new ObjectId(farmerID) },
    { $set: { "orderLock": "true" }}
  );
}

async function unlockFarmerForOrders(collection, farmerID) {
  return collection.updateOne(
    { _id: new ObjectId(farmerID) },
    { $set: { "orderLock": "false" }}
  );
}

async function validateFarmerID(collection, farmerID) {
  return collection.findOne({ _id: new ObjectId(farmerID) });
}

async function findFarmers(collection) {
  return collection.find({}).toArray();
}

async function insertFarmer(collection, farmerJSON) {
  return collection.insertOne(farmerJSON);
}

async function modifyFarmer(collection, id, farmerJSON) {
  return collection.updateOne(
      { _id: ObjectId(id) },
      { $set: farmerJSON });
}

async function deleteFarmer(collection, id) {
  return collection.findOneAndDelete({ _id: new ObjectId(id) });
}

async function getFarmerImage(collection, farmerID) {
  try {
    const farmer = await collection.findOne({ _id: new ObjectId(farmerID) });
    return typeof farmer['image'] === 'string' ?
      farmer['image'] :
      new Error("IMAGE URI NOT FOUND");
  } catch (err) {
    throw err;
  }
}
