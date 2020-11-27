const debug = require('debug')('data:permissions');

const { generateWithCollectionFunction } = require('./mongo');
const { ObjectId } = require('mongodb');

const {
  db_name,
  permissions_collection_name
} = require('./mongo-constants');

const withPermissionsCollection = generateWithCollectionFunction(db_name, permissions_collection_name);

[
  insertPermission,
  removePermission,
  getPermissionByID,
  getPermissionsForResource,
  getPermissionsForRole
].forEach((f) => {
  module.exports[f.name] = withPermissionsCollection(f)
});

function insertPermission(collection, permissionObject) {
  //example permissionObject: { role: 'admin', resource: 'video', action: 'create', attributes: ['*'] }
  //example permissionObject: { role: 'admin', resource: 'video', action: ['create', 'modify'], attributes: ['*'] },
  //example permissionObject: { role: 'admin', resource: 'video', action: '*', attributes: ['*'] },

  return collection.insertOne(permissionObject);
}

function removePermission(collection, permissionID) {
  return collection.findOneAndDelete({ _id: new ObjectId(permissionID) });
}

function getPermissionByID(collection, permissionID) {
  return collection.findOne({ _id: new ObjectId(permissionID) });
}

function getPermissionsForResource(collection, resource) {
  return collection.find({ resource }).toArray();
}

function getPermissionsForRole(collection, role) {
  return collection.find({ role }).toArray();
}
