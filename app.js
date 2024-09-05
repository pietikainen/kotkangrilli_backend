// app.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const { Model } = require('objection');
const Knex = require('knex');
const knexConfig = require('./knexfile');
const passport = require('./controllers/authController');
const cors = require('cors');





dotenv.config();

const app = express();
const knex = Knex(knexConfig.development);

// Bind all Models to the knex instance
Model.knex(knex);


// SOS! Bypass authentication for testing purposes SOS! //
const bypassAuthentication = (req, res, next) => {

  req.user = { id: 1, userlevel: 9 };
  req.isAuthenticated = () => true;
  next();
}

if (process.env.NODE_ENV === 'development') {
  app.use(bypassAuthentication);
}
// SOS! Bypass authentication for testing purposes SOS! //



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));

const corsOptions = {
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true
};

app.use(cors(corsOptions));
app.use(passport.initialize());
app.use(passport.session());

const proxyRoutes = require('./routes/proxyRoutes');
app.use(express.text({ type: '*/*' }));
app.use(express.json());
app.use('/proxy', proxyRoutes);

const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);


app.get('/', (req, res) => {
  res.status(418).json({ message: 'I am a teapot, DERP.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
