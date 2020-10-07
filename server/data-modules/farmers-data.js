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
  deleteFarmer,
  getFarmerImage
}

async function validateFarmerID(farmerID) {
  const [ err, collection ] = await mongo.getCollection(db_name, farmers_collection_name);
  if(err) { throw err; }

  return collection.findOne({ _id: farmerID });
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

async function deleteFarmer(id) {
  const [ err, collection ] = await mongo.getCollection(db_name, farmers_collection_name);
  if(err) { throw err; }

  return collection.findOneAndDelete({ _id: new ObjectId(id) });
}

async function getFarmerImage(farmerID) {
  const [ err, collection ] = await mongo.getCollection(db_name, farmers_collection_name);
  if(err) { throw err; }

  try {
    const farmer = collection.findOne({ _id: new ObjectId(farmerID) });
    return typeof farmer['image'] === 'string' ?
      farmer['image'] :
      new Error("IMAGE URI NOT FOUND");
  } catch (err) {
    throw err;
  }
}
