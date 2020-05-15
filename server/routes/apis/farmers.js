var fs = require('fs');

var express = require('express');
var router = express.Router();
var mongo = require('../../utils/mongo');

router.get('/', async function(req, res, next) {
  let mongoClient = mongo.getClient()
  let db = mongoClient.db("farmers");
  payload = await findDocuments(db);
  // payload = JSON.parse(fs.readFileSync("samples/farmers.json", "utf8"));
  res.json(payload);
});

function findDocuments(db) {
  // Get the documents collection
  return new Promise((resolve) => {
    const collection = db.collection('farmers');
    // Find some documents
    collection.find({}).toArray((err, docs) => {
      console.log("Found the following records");
      console.log(docs)
      resolve(docs);
    });
  })
}

module.exports = router;
