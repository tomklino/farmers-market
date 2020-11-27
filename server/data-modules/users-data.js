const debug = require('debug')('data:users');

const { generateWithCollectionFunction } = require('./mongo');
const { ObjectId } = require('mongodb');

const {
  db_name,
  users_collection_name
} = require('./mongo-constants');

const withUsersCollection = generateWithCollectionFunction(db_name, users_collection_name);

[
  insertUser,
  findUser,
  setAdminPrivilege,
  revokeAdminPrivilege,
  setUserInfo
].forEach((f) => {
  module.exports[f.name] = withUsersCollection(f)
});

async function insertUser(collection, userJSON) {
  return new Promise((resolve) => {
    collection.insertOne(userJSON, (err, r) => {
      debug("user inserted successfully", r);
      resolve(err);
    });
  });
}

async function findUser(collection, username) {
  debug("trying to find user with username", username);
  try {
    return collection.findOne({ username });
  } catch (err) {
    return err;
  }
}

async function setUserRole(collection, username, role) {
  return collection.updateOne(
    { username },
    { $set: { role }}
  )
}

async function setAdminPrivilege(collection, username) {
  return collection.updateOne(
    { username },
    { $set: { admin: "true", role: "admin" }});
}

async function revokeAdminPrivilege(collection, username) {
  return collection.updateOne(
    { username },
    { $set: { admin: "false", role: "user" }});
}

async function setUserInfo(collection, username, userInfo) {
  return collection.updateOne(
    { username },
    { $set: { userInfo }});
}
