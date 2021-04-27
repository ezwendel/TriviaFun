const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');
const session = require('express-session');
const configRoutes = require('./routes');
const exphbs = require('express-handlebars');

app.use(session({
  name: 'AuthCookie',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: true
}))

app.use('/login', (req, res, next) => {
  if (req.session.AuthCookie) {
    return res.redirect('/private');
  } else {
    next();
  }
});

app.use((req, res, next) => {
  currentTime = new Date
  logStr = `[${currentTime.toUTCString()}]: ${req.method} ${req.originalUrl}`
  if (req.session.AuthCookie) {
    logStr += ` (Authenticated User)`
  } else {
    logStr += ` (Non-Authenticated User)`
  }
  console.log(logStr)
  next();
});

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', exphbs({ defaultLayout: 'main', helpers:{
  counter: function (index){return index + 1;}
} }));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});