const debug = require('debug')('server:users');

const { OAuth2Client } = require('google-auth-library');
const express = require('express');
const router = express.Router();

const CLIENT_ID = process.env['GOOGLE_CLIENT_ID']
const client = new OAuth2Client(CLIENT_ID);

const usersData = require('../data-modules/users-data');

router.get('/whoami', function(req, res, next) {
  let payload = {};
  if (!req.session.logged_in) {
    payload.message = "Not logged in";
    res.status(401).json(payload);
    return;
  }

  payload.user = req.session['user'];
  if (typeof req.session['email'] === "string") {
    payload.email = req.session['email'];
  }
  payload.admin = req.session['admin'];
  payload.with_google = req.session['with_google'] ? "true" : "false";
  res.json(payload);
});

router.get('/myinfo', async function(req, res, next) {
  let payload = {};
  if (!req.session.logged_in) {
    payload.message = "Not logged in";
    res.status(401).json(payload);
    return;
  }

  const { userInfo } = await usersData.findUser(userEmail);
  payload.userInfo = userInfo;

  res.json(payload);
});

router.post('/logout', function(req, res, next) {
  console.log("got a logout request");
  req.session.logged_in = false;
  req.session.user = "";
  req.session.admin = false;
  req.session.with_google = false;

  let payload = {};
  payload.message = "Logged out";
  res.json(payload);
});

router.post('/update/:username', async function(req, res, next) {
  console.log("got an update request");
  if(!req.session.admin && req.session.user !== req.params.username) {
    const error_message = "not authorized to change user info";
    console.log("ERROR", error_message);
    return res.status(401).json({ message: "Unauthorized", error_message});
  }
  
  const { userInfo } = req.body;
  if(!userInfo) {
    const error_message = "no userInfo provided in update request";
    console.log("ERROR", error_message);
    return res.status(400).json({ message: "Invalid Request", error_message });
  }

  const err = await usersData.setUserInfo(req.params.username, userInfo);
  if(err instanceof Error) {
    const error_message = "internal error trying to persist data to database";
    console.log("ERROR", error_message);
    return res.status(400).json({ message: "Internal Error", error_message });
  }
  res.json({ message: "done" });
});

router.post('/google-signin', async function(req, res, next) {
  let id_token = req.body.id_token;
  if(!id_token) {
    console.log("google-signin point reached, but no id_token provided");
    return res.status(400).json({ error: "Bad request" });
  }

  let googleResponse = await googleVerify(id_token);
  let userID = googleResponse['sub'];
  let userEmail = googleResponse['email'];

  let userEntry = await usersData.findUser(userEmail);
  if(userEntry === null) {
    let userJSON = {}
    userJSON.username = userEmail;
    userJSON.user_email = userEmail;
    userJSON.admin = false;
    userJSON.with_google = true;
    await usersData.insertUser(userJSON);
    userEntry = userJSON;
    debug("userEntry is now", userEntry);
  }
  debug("userEntry (from db) is", userEntry);
  console.log(`google-signin point reached, verified to the following user_id and email: ${userID} ${userEmail}`);

  req.session.logged_in = true;

  req.session.user = userEntry.username;
  req.session.email = userEntry.user_email;
  req.session.admin = userEntry.admin;
  req.session.with_google = true;

  let payload = {};
  payload.message = `logged in as ${userEmail}`;
  res.json({ message: "done" });
});

if(process.env["ENVIRONMENT"] === "DEV") {
  console.log("WARNING: environment is set to dev - enabling dev admin user");

  router.post('/login/devadmin', function(req, res, next) {
    if(req.body.password === "DevAdmin1590") {
      req.session.logged_in = true;
      req.session.user = "devadmin";
      req.session.admin = "true";

      let payload = {};
      payload.message = "logged in as devadmin";
      res.json(payload);
      return;
    }

    payload.message = "cannot login as devadmin";
    req.status(405).json(payload);
  })
}

async function googleVerify(id_token) {
  const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: CLIENT_ID
  });
  const payload = ticket.getPayload();
  return payload;
}

module.exports = router;
