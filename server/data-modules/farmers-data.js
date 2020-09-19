const debug = require('debug')('data:farmers');

const mongo = require('./mongo');
const { ObjectId } = require('mongodb'); // or ObjectID

const {
  db_name,
  orders_collection_name,
  farmers_collection_name
} = require('./mongo-constants');

module.exports = {
  validateFarmerID
}

async function validateFarmerID(farmerID) {
  let collection = await mongo.getCollection(db_name, farmers_collection_name);

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
