var express = require('express');
var router = express.Router();

var farmersRouter = require('./apis/farmers');
var ordersRouter = require('./apis/orders');

router.use('/farmers', farmersRouter);
router.use('/orders', ordersRouter);

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
