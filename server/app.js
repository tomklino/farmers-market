const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter   = require('./routes/api');

const app = express();

app.use(cookieSession({
  secret: process.env['COOKIE_SECRET'],
  signed: true
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

if(!isNaN(parseInt(process.env['SIMULATED_DELAY_MS']))) {
  app.use('/', (req, res, next) => { setTimeout(next, process.env['SIMULATED_DELAY_MS']); });
}
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter)
module.exports = app;
