var express = require('express');
var router = express.Router();

var farmersRouter = require('./apis/farmers');

router.use('/farmers', farmersRouter);

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
