const MongoClient = require('mongodb').MongoClient;

const url = process.env['MONGO__CONNECTION_STRING'] || 'mongodb://localhost:27017';
const dbName = process.env['MONGO__DBNAME'] || 'defaultdb';

const mongoClient = new MongoClient(url);

async function getClient() {
  if(!mongoClient || !mongoClient.isConnected()) {
    let err = await mongoClient.connect();
    if (err instanceof Error) {
      return [ err, null ];
    }
  }
  return [ null, mongoClient ];
}

async function getDB(db_name) {
  let [ err, mongoClient ] = await getClient();
  if(err instanceof Error) {
    return [ err, null ];
  }
  return [ null, mongoClient.db(db_name) ];
}

async function getCollection(db_name, collection_name) {
  let [ err, db ] = await getDB(db_name);
  if(err instanceof Error) {
    return [ err, null ];
  }
  return [ null, db.collection(collection_name) ];
}

module.exports = { getClient, getDB, getCollection }
