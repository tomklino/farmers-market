var fs = require('fs');

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  payload = JSON.parse(fs.readFileSync("samples/farmers.json", "utf8"));
  res.json(payload);
});

module.exports = router;
