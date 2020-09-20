const debug = require('debug')('data:users');

const mongo = require('./mongo');
const { ObjectId } = require('mongodb');

const {
  db_name,
  users_collection_name
} = require('./mongo-constants');

module.exports = {};

async function insertUser(userJSON) {
  const collection = await mongo.getCollection(db_name, users_collection_name);

  return new Promise((resolve) => {
    collection.insertOne(userJSON, (err, r) => {
      debug("user inserted successfully", r);
      resolve(err);
    });
  });
}
