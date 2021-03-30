var debug = require('debug')('server:permissions');

var express = require('express');
var router = express.Router();

const permissionsData = require('../../data-modules/permissions-data');

router.get('/', async function(req, res, next) {
  payload = await permissionsData.findPermissions();
  if(payload instanceof Error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
  res.json(payload);
});

module.exports = router;
