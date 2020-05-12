var fs = require('fs');

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  payload = fs.readFileSync("samples/farmers.json");
  res.send(payload);
});

module.exports = router;
