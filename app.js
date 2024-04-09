
import express from 'express';
import session from 'express-session';
import exphbs from 'express-handlebars';
import configRoutes from './routes/index.js';
import moment from 'moment';
const app = express();
const staticDir = express.static('public');
const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    formatDate: function (date, locale = 'en-US', options = '{}') {
      let formatOptions;
      try {
          // Safely parsing options string to an object
          formatOptions = JSON.parse(options);
      } catch (e) {
          console.error('Error parsing date format options:', e);
          formatOptions = {};
      }

      const formatter = new Intl.DateTimeFormat(locale, {
          year: 'numeric', month: 'long', day: 'numeric',
          ...formatOptions // Spread parsed options
      });
      return formatter.format(new Date(date));
  }
  }
});

app.use(
  session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: false
  })
);
app.use('/login', (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin');
    } else if (req.session.user.role === 'user') {
      return res.redirect('/protected');
    }
  }
  next();
});
app.use('/register', (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.role === 'user') {
      return res.redirect('/protected');
    }
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin');
    }
  }
  next();
});
app.use('/protected', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
});
app.use('/admin', (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/login');
  }
  next();
});
app.use('/logout', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
});

app.use((req, res, next) => {
  let curr_timestamp = new Date().toUTCString();
  let req_method = req.method;
  let req_route = req.originalUrl;
  let usercheck;
  if (req.session.user) {
    usercheck = '(Authenticated User)';
  } else {
    usercheck = '(Non-Authenticated User)';
  }
  console.log(curr_timestamp + ': ' + req_method + ' / ' + req_route + ' ' + usercheck);
  next();
});

app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
