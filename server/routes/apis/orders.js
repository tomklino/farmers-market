const debug = require('debug')('server:orders');

const express = require('express');
const router = express.Router();
const request = require('request');

const ordersData = require('../../data-modules/orders-data');
const farmersData = require('../../data-modules/farmers-data');
const usersData = require('../../data-modules/users-data');

const { emailOrder } = require('../../utils/order-email');

router.get('/byfarmer/:farmerID', async function(req, res, next) {
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

router.get('/byuser', async function(req, res, next) {
  const username = req.query['username'];
  debug(`looking for order by user ${username}`);
  if(typeof username !== "string") {
    return res.status(400).json({ message: "username param is missing" });
  }

  if(!req.session['logged_in'] || !req.session['user']) {
    debug("point cannot return - user not logged in");
    return res.status(401).json({ message: "not logged in" });
  }

  if(req.session['user'] !== username && req.session['admin'] !== true) {
    return res.status(403).json({ message: "user not authorized to list orders by the requested username"});
  }

  try {
    const orders = await ordersData.findOrdersByUser(username);
    debug(`found the following orders for ${username}: ${orders}`)
    return res.json({ orders });
  } catch (err) {
    debug("ERROR while trying to find user orders", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post('/modify', async function(req, res, next) {
  let orderJSON = req.body;
  debug("got a request to modify order", orderJSON);

  let [ validated, violations ] = await validateOrderJSON(orderJSON);
  if(!validated) {
    debug("refusing to modify order - invalid payload");
    res.status(400).json({ message:"invalid JSON", violations });
    return;
  }

  const locked = await farmersData.isFarmerLockedForOrders(orderJSON['farmerID']);
  const completed = await ordersData.isOrderComplete(orderJSON['orderID']);
  if(locked || completed) {
    const reason = completed ? "order has already been delivered" : "no more modifications allowed for this farmer";
    return res.status(423).json({ message: `not allowed. ${reason}` })
  }

  try {
    await ordersData.modifyOrder(orderJSON);
  } catch (err) {
    debug("encountered error while trying to modify order", err);
    return res.status(500).send("Internal Error");
  }

  if(typeof orderJSON.email === 'undefined') {
    console.log("Warning: received an order with no email", orderJSON);
  } else {
    emailOrder(orderJSON, orderJSON.email)
      .then(() => debug("emailed successfully"))
      .catch((err) => debug("error trying to send email:", err));
  }

  const modifiedOrder = await ordersData.findOrder(orderJSON['orderID']);
  res.json(modifiedOrder);
});

router.post('/new', async function(req, res, next) {
  let orderJSON = req.body;
  debug("got request for a new order");

  let [ validated, violations ] = await validateOrderJSON(orderJSON);
  if(!validated) {
    debug("refusing to add an invalid order");
    return res.status(400).json({ message: "invalid JSON", violations });
  }

  const locked = await farmersData.isFarmerLockedForOrders(orderJSON['farmerID']);
  if(locked) {
    return res.status(423).json({ message: "not allowed. farmer locked for orders" })
  }

  if(req.session['logged_in']) {
    //TODO make sure there is an index on created_by
    orderJSON['created_by'] = req.session['user'];
  }
  orderJSON['created_at_timestamp'] = Math.floor(Date.now() / 1000);
  //TODO: add expires_at_timestamp for the last date of farmer arrival + 24h

  let [ err, orderID ] = await ordersData.insertOrder(orderJSON);
  if (err) {
    debug("encountered error while trying to insert order", err);
    res.status(500).send("Internal Error");
    return;
  }
  orderJSON['_id'] = orderID;

  // TODO: check for a valid email address before sending
  if(typeof orderJSON.email === 'undefined') {
    console.log("Warning: received an order with no email", orderJSON);
  } else {
    emailOrder(orderJSON, orderJSON.email)
      .then(() => debug("emailed successfully"))
      .catch((err) => debug("error trying to send email:", err));
  }
  res.json(orderJSON);
});

router.post("/complete", async function(req, res, next) {
  // TODO check session is logged in

  try {
    let payload = await ordersData.completeOrder(req.body.orderID);
    if(payload instanceof Error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    debug("completed order:", payload.result);
    res.json({ message: "done" });
  } catch (err) {
    debug("error while trying to complete order", err);
    res.status(500).json({ message: "failed" });
  }

  //TODO if order has a created_by field, remove order from user's active_orders
});

router.post("/uncomplete", async function(req, res, next) {
  // TODO check session is logged in

  try {
    let payload = await ordersData.unCompleteOrder(req.body.orderID);
    if(payload instanceof Error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    debug("undo complete order:", payload.result);
    res.json({ message: "done" });
  } catch (err) {
    debug("error while trying to uncomplete order", err);
    res.status(500).json({ message: "failed" });
  }

  // TODO if order has a created_by field, and not yet expired, re-append to user's active_orders
});

router.post("/markpayed", async function(req, res, next) {
  // TODO check session is logged in

  try {
    let payload = await ordersData.markAsPayed(req.body.orderID);
    if(payload instanceof Error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    debug("mark order payed:", payload.result);
    res.json({ message: "done" });
  } catch (err) {
    debug("error while trying to complete order", err);
    res.status(500).json({ message: "failed" });
  }

  //TODO if order has a created_by field, remove order from user's active_orders
});

router.post("/unmarkpayed", async function(req, res, next) {
  // TODO check session is logged in

  try {
    let payload = await ordersData.unmarkAsPayed(req.body.orderID);
    if(payload instanceof Error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    debug("undo payed order:", payload.result);
    res.json({ message: "done" });
  } catch (err) {
    debug("error while trying to uncomplete order", err);
    res.status(500).json({ message: "failed" });
  }

  // TODO if order has a created_by field, and not yet expired, re-append to user's active_orders
});

router.put('/cancel/:orderID', async function(req, res, next) {
  //TODO check if the user is allowed to perform a cancel
  const orderID = req.params['orderID'];

  if(typeof orderID !== 'string') {
    return res.status(400).json({ message: "invalid request - must include a valid orderID" });
  }

  try {
    await ordersData.cancelOrder(orderID);
  } catch (err) {
    return res.status(500).json({ message: "internal server error while trying to cancel order" });
  }

  return res.json({ message: "done" });
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
