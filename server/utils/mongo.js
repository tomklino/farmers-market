const MongoClient = require('mongodb').MongoClient;

const url = process.env['MONGO__CONNECTION_STRING'] || 'mongodb://localhost:27017';
const dbName = process.env['MONGO__DBNAME'] || 'defaultdb';

var mongoClient;
// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  if (err) {
    console.error("Error occured while trying to connect to mongo", err)
    process.exit(1)
  }
  mongoClient = client;
  console.log("MONGO: Connected successfully to server");
});

function getClient() {
  //TODO if not connected - connect
  return mongoClient
}

module.exports = { getClient }
