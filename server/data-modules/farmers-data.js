const debug = require('debug')('data:farmers');

const mongo = require('./mongo');
const { ObjectId } = require('mongodb'); // or ObjectID

const {
  db_name,
  orders_collection_name,
  farmers_collection_name
} = require('./mongo-constants');

module.exports = {
  validateFarmerID,
  findFarmers,
  insertFarmer,
  deleteFarmer
}

async function validateFarmerID(farmerID) {
  const collection = await mongo.getCollection(db_name, farmers_collection_name);

  return new Promise((resolve) => {
    collection.findOne({ _id: farmerID }, (err, doc) => {
      if(err) {
        debug("error while trying to verify farmer");
        resolve(err.toString());
        return;
      }
      resolve(true);
    });
  });
}

async function findFarmers() {
  const collection = await mongo.getCollection(db_name, farmers_collection_name);

  return new Promise((resolve) => {
    collection.find({}).toArray((err, docs) => {
      debug("Found the following records");
      debug(docs)
      resolve(docs);
    });
  });
}

async function insertFarmer(farmerJSON) {
  const collection = await mongo.getCollection(db_name, farmers_collection_name);

  return new Promise((resolve) => {
    collection.insertOne(farmerJSON, (err, r) => {
      debug("farmer inserted successfully", r);
      resolve(err);
    });
  });
}

async function deleteFarmer(id) {
  const collection = await mongo.getCollection(db_name, farmers_collection_name);

  return new Promise((resolve) => {
    collection.findOneAndDelete({ _id: new ObjectId(id) }, (err, r) => {
      debug("farmer deleted", r);
      resolve(err);
    });
  });
}
