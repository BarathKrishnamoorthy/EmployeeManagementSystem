require('./models/db');
require('dotenv').config();
const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const bodyparser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require('./middaleware/secruity');
const router = require('./router/EmployeeRouter');
const app = express();
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,

}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(bodyparser.json());
app.use('/', router);
app.set('views', path.join(__dirname, '/views/'));
app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'mainLayout',
  layoutsDir: path.join(__dirname, '/views/layouts/')
}));
app.set('view engine', 'hbs');
app.listen(3000, () => {
  console.log('Express server started at port : 3000');
});



