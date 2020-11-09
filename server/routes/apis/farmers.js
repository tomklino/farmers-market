var debug = require('debug')('server:farmers');

var express = require('express');
var router = express.Router();

const ordersData = require('../../data-modules/orders-data');
const farmersData = require('../../data-modules/farmers-data');
const ac = require('../../rbac/index.js');
const { getRole } = require('../../rbac/utils');

router.put('/lockorders/:id', async function(req, res) {
  const userRole = getRole(req.session);
  const permission = await ac.can(userRole).execute('lock').on('farmer')
  if(!permission.granted) {
    return res.status(401).json({ message: "not allowed" });
  }

  if(typeof req.params['id'] !== "string") {
    return res.status(400).json({ message: "farmer id not set correctly" });
  }

  try {
    await farmersData.lockFarmerForOrders(req.params['id']);
    return res.json({ message: "done" });
  } catch (err) {
    console.log("Error while trying to lock farmer for orders", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put('/unlockorders/:id', async function(req, res) {
  const userRole = getRole(req.session);
  const permission = await ac.can(userRole).execute('unlock').on('farmer')
  if(!permission.granted) {
    return res.status(401).json({ message: "not allowed" });
  }

  if(typeof req.params['id'] !== "string") {
    return res.status(400).json({ message: "farmer id not set correctly" });
  }

  try {
    await farmersData.unlockFarmerForOrders(req.params['id']);
    return res.json({ message: "done" });
  } catch (err) {
    console.log("Error while trying to lock farmer for orders", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post('/', async function(req, res, next) {
  const userRole = getRole(req.session);
  const permission = await ac.can(userRole).execute('create').on('farmer')
  debug("permission", permission, "role", userRole);
  if(!permission.granted) {
    return res.status(401).json({ message: "not allowed" });
  }

  let payload = req.body;
  debug("got request for a new farmer");
  let [ validated, violations ] = validateFarmerJSON(payload);
  if(!validated) {
    debug("refusing to add an invalid farmer");
    res.status(400).json({ message: "invalid JSON: " + violations });
    return;
  }

  payload.created_by = req.session['user'];

  try {
    await farmersData.insertFarmer(payload);
    res.json({ message: "done" });
  } catch (err) {
    debug("encountered error while trying to insert farmer", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put('/:id', async function(req, res, next) {
  const userRole = getRole(req.session);
  const owner = await farmersData.getFarmerOwner(req.params['id']);
  const context = { requester: req.session['user'], owner };
  const permission = await ac.can(userRole).context(context).execute('modify').on('farmer');
  if(!permission.granted) {
    return res.status(401).json({ message: "not allowed" });
  }

  let payload = req.body;
  delete payload._id;
  delete payload.created_by;

  payload = permission.filter(payload);

  debug("got request to edit farmer");
  let [ validated, violations ] = validateFarmerJSON(payload);
  if(!validated) {
    debug("refusing to edit an invalid farmer request");
    res.status(400).json({ message: "invalid JSON: " + violations });
    return;
  }
  let err = await farmersData.modifyFarmer(req.params['id'], payload);
  if (err instanceof Error) {
    debug("encountered error while trying to insert farmer", err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
  res.send("Done");
});

router.delete('/:id', async function(req, res, next) {
  let id = req.params.id;
  debug("requesting to delete", id);

  try {
    await farmersData.deleteFarmer(id);
    res.send("Done");
  } catch (err) {
    debug("encountered an error while trying to delete farmer", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get('/', async function(req, res, next) {
  payload = await farmersData.findFarmers();
  if(payload instanceof Error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
  res.json(payload);
});

function validateFarmerJSON(farmerJSON) {
  let rules = {
    name: [
      v => typeof v === 'string' || "name must be a string",
    ],
    products: [
      v => Array.isArray(v) || "products must be an array",
    ],
    orderMinimum: [
      v => typeof v !== 'undefined' || "orderMinimum must be set",
    ],
    arrivalDates: [
      v => Array.isArray(v) || "arrivalDates must be an array",
      // TODO check valid dates
    ],
    shipmentArea: [
      v => typeof v === 'string' || "shipmentArea must be a string",
    ]
  }

  let violations = [];
  for(let [key, ruleSet] of Object.entries(rules)) {
    for (rule of ruleSet) {
      let outcome = rule(farmerJSON[key]);
      if (typeof outcome === 'string') {
        violations.push(outcome);
      }
    }
  }

  return [ violations.length === 0, violations ];
}

module.exports = router;
