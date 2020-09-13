const { OAuth2Client } = require('google-auth-library');

const express = require('express');
const router = express.Router();

const CLIENT_ID = process.env['GOOGLE_CLIENT_ID']
const client = new OAuth2Client(CLIENT_ID);

router.get('/whoami', function(req, res, next) {
  let payload = {};
  if (!req.session.logged_in) {
    payload.message = "Not logged in";
    res.status(401).json(payload);
    return;
  }

  payload.user = req.session['user'];
  payload.admin = req.session['admin'];
  res.json(payload);
});

router.post('/logout', function(req, res, next) {
  console.log("got a logout request");
  req.session.logged_in = false;
  req.session.user = "";
  req.session.admin = false;

  let payload = {};
  payload.message = "Logged out";
  res.json(payload);
});

router.post('/google-signin', async function(req, res, next) {
  let id_token = req.body.id_token;
  if(!id_token) {
    console.log("google-signin point reached, but no id_token provided");
    return res.status(400).json({error: "Bad request"});
  }

  let googleResponse = await googleVerify(id_token);
  let userID = googleResponse['sub'];
  let userEmail = googleResponse['email'];
  console.log(`google-signin point reached, verified to the following user_id and email: ${userID} ${userEmail}`);

  req.session.logged_in = true;
  req.session.user = userEmail;
  req.session.admin = false;

  let payload = {};
  payload.message = `logged in as ${userEmail}`;
  res.json({ message: "success" });
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
