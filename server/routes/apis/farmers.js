var debug = require('debug')('server:farmers');

var express = require('express');
var router = express.Router();

const ordersData = require('../../data-modules/orders-data');
const farmersData = require('../../data-modules/farmers-data');

router.put('/lockorders/:id', async function(req, res) {
  if(req.session['admin'] !== "true") {
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
  if(req.session['admin'] !== "true") {
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

router.post('/new', async function(req, res, next) {
  let payload = req.body;
  debug("got request for a new farmer");
  let [ validated, violations ] = validateFarmerJSON(payload);
  if(!validated) {
    debug("refusing to add an invalid farmer");
    res.status(400).send("invalid JSON: " + violations);
    return;
  }
  let err = await farmersData.insertFarmer(payload);
  if (err instanceof Error) {
    debug("encountered error while trying to insert farmer", err);
    res.status(500).json({ message: "Internal Error" });
    return;
  }
  res.send("Done");
});

router.delete('/:id', async function(req, res, next) {
  let id = req.params.id;
  let err = await farmersData.deleteFarmer(id);
  debug("requesting to delete", id);
  if (err) {
    debug("encountered an error while trying to delete farmer", err);
    res.status(500).send("Internal Error");
    return;
  }
  res.send("Done");
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
    packageSize: [
      v => typeof v !== 'undefined' || "packageSize must be set",
    ],
    packageUnit: [
      v => [ "Kg", "gr" ].includes(v) || "packageUnit must be on of 'Kg', 'gr'",
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
    price: [
      v => typeof v !== 'undefined' || "price must be set",
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
