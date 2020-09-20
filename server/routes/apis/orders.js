const debug = require('debug')('server:orders');

const express = require('express');
const router = express.Router();
const request = require('request');

const ordersData = require('../../data-modules/orders-data');
const farmersData = require('../../data-modules/farmers-data');

const { emailOrder } = require('../../utils/order-email');

router.get('/:farmerID', async function(req, res, next) {
  payload = await ordersData.findOrders(req.params.farmerID);
  if(payload instanceof Error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
  res.json(payload);
});

router.get('/byid/:orderID', async function(req, res, next) {
  payload = await ordersData.findOrder(req.params.orderID);
  if(payload instanceof Error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
  payloadArray = [ payload ];
  debug("orders/byid - response:", payloadArray);
  res.json(payloadArray);
});

router.post('/modify', async function(req, res, next) {
  let payload = req.body;
  debug("got a request to modify order", payload);

  let [ validated, violations ] = await validateOrderJSON(payload);
  if(!validated) {
    debug("refusing to modify order - invalid payload");
    res.status(400).send("invalid JSON: " + violations);
    return;
  }
  let err = await ordersData.modifyOrder(payload);
  if (err) {
    debug("encountered error while trying to modify order", err);
    res.status(500).send("Internal Error");
    return;
  }

  if(typeof payload.email === 'undefined') {
    console.log("Warning: received an order with no email", payload);
  } else {
    emailOrder(payload, payload.email)
    .then(() => debug("emailed successfully"))
    .catch((err) => debug("error trying to send email:", err));
  }

  console.log("done modifying order");
  res.send("Done");
});

router.post('/new', async function(req, res, next) {
  let orderJSON = req.body;
  debug("got request for a new order");

  let [ validated, violations ] = await validateOrderJSON(orderJSON);
  if(!validated) {
    debug("refusing to add an invalid order");
    res.status(400).send("invalid JSON: " + violations);
    return;
  }
  let err = await ordersData.insertOrder(orderJSON);
  if (err) {
    debug("encountered error while trying to insert order", err);
    res.status(500).send("Internal Error");
    return;
  }

  // TODO: check for a valid email address before sending
  if(typeof orderJSON.email === 'undefined') {
    console.log("Warning: received an order with no email", orderJSON);
  } else {
    emailOrder(orderJSON, orderJSON.email)
    .then(() => debug("emailed successfully"))
    .catch((err) => debug("error trying to send email:", err));
  }
  res.send("Done");
});

router.post("/complete", async function(req, res, next) {
  // TODO check session is logged in

  try {
    let payload = (await ordersData.completeOrder(req.body.orderID));
    if(payload instanceof Error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    debug("completed order:", payload.result);
    res.json({ message: "done" });
  } catch (err) {
    debug("error while trying to complete order", err);
    res.status(500).json({ message: "failed" });
  }
});

router.post("/uncomplete", async function(req, res, next) {
  // TODO check session is logged in

  try {
    let payload = (await ordersData.unCompleteOrder(req.body.orderID));
    if(payload instanceof Error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    debug("undo complete order:", payload.result);
    res.json({ message: "done" });
  } catch (err) {
    debug("error while trying to uncomplete order", err);
    res.status(500).json({ message: "failed" });
  }
});

async function validateOrderJSON(orderJSON) {
  let rules = {
    name: [
      v => typeof v === 'string' || "name must be a string",
    ],
    phone: [
      v => !!v || "phone must be defined",
      // TODO verify with regex
    ],
    products: [
      v => Array.isArray(v) || "products must be an array",
    ],
    farmerID: [
      farmersData.validateFarmerID
    ]
  }

  let violations = [];
  for(let [key, ruleSet] of Object.entries(rules)) {
    for (rule of ruleSet) {
      let outcome = await rule(orderJSON[key]);
      if (typeof outcome === 'string') {
        violations.push(outcome);
      }
    }
  }

  return [ violations.length === 0, violations ];
}

module.exports = router;
