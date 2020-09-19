const MongoClient = require('mongodb').MongoClient;

const url = process.env['MONGO__CONNECTION_STRING'] || 'mongodb://localhost:27017';
const dbName = process.env['MONGO__DBNAME'] || 'defaultdb';

var mongoClient;
// Use connect method to connect to the server

function connect() {
  return new Promise((resolve) => {
    MongoClient.connect(url, function(err, client) {
      if (err) {
        console.error("Error occured while trying to connect to mongo", err)
        process.exit(1)
      }
      mongoClient = client;
      console.log("MONGO: Connected successfully to server");
      resolve();
    });
  })
}

async function getClient() {
  if(!mongoClient || !mongoClient.isConnected()) {
    await connect();
  }
  return mongoClient
}

async function getDB(db_name) {
  let mongoClient = await getClient();
  return mongoClient.db(db_name);
}

async function getCollection(db_name, collection_name) {
  let db = await getDB(db_name);
  return db.collection(collection_name);
}

module.exports = { getClient, getDB, getCollection }
