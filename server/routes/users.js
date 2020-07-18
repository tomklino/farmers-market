var express = require('express');
var router = express.Router();

router.get('/whoami', function(req, res, next) {
  let payload = {};
  if (!req.session.logged_in) {
    payload.message = "Not logged in";
    res.status(401).json(payload);
    return;
  }

  payload.user = req.session['user']
  res.json(payload);
});

if(process.env["ENVIRONMENT"] === "DEV") {
  console.log("WARNING: environment is set to dev - enabling dev admin user");
  let payload = {};
  router.post('/login/devadmin', function(req, res, next) {
    if(req.body.password === "DevAdmin1590") {
      req.session.logged_in = true;
      req.session.user = "devadmin";
      payload.message = "logged in as devadmin";
      res.json(payload);
      return;
    }

    payload.message = "cannot login as devadmin";
    req.status(405).json(payload);
  })
}

module.exports = router;
