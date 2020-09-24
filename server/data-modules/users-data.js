const debug = require('debug')('data:users');

const mongo = require('./mongo');
const { ObjectId } = require('mongodb');

const {
  db_name,
  users_collection_name
} = require('./mongo-constants');

module.exports = {
  insertUser,
  findUser,
  setAdminPrivilege,
  revokeAdminPrivilege,
  setUserInfo
};

async function insertUser(userJSON) {
  const [ err, collection ] = await mongo.getCollection(db_name, users_collection_name);
  if(err) {
    return err;
  }

  return new Promise((resolve) => {
    collection.insertOne(userJSON, (err, r) => {
      debug("user inserted successfully", r);
      resolve(err);
    });
  });
}

async function findUser(username) {
  const [ err, collection ] = await mongo.getCollection(db_name, users_collection_name);
  if(err) {
    return err;
  }

  return new Promise((resolve) => {
    debug("trying to find user with username", username);
    collection.findOne({ username }, (err, result) => {
      if(err) {
        console.log("error while trying to fetch order", err);
        return resolve(err);
      }
      debug("found the following user", result);
      resolve(result);
    });
  });
}

async function setAdminPrivilege(username) {
  const [ err, collection ] = await mongo.getCollection(db_name, users_collection_name);
  if(err) {
    return err;
  }

  return collection.updateOne(
    { username },
    { $set: { admin: "true" }});
}

async function revokeAdminPrivilege(username) {
  const [ err, collection ] = await mongo.getCollection(db_name, users_collection_name);
  if(err) {
    return err;
  }

  return collection.updateOne(
    { username },
    { $set: { admin: "false" }});
}

async function setUserInfo(username, userInfo) {
  const [ err, collection ] = await mongo.getCollection(db_name, users_collection_name);
  if(err) {
    return err;
  }

  return collection.updateOne(
    { username },
    { $set: { userInfo }});
}
