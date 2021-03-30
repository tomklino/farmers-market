var express = require('express');
var router = express.Router();

var farmersRouter = require('./apis/farmers');
var ordersRouter = require('./apis/orders');
var permissionsRouter = require('./apis/permissions');

router.use('/farmers', farmersRouter);
router.use('/orders', ordersRouter);
router.use('/permissions', permissionsRouter);

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
