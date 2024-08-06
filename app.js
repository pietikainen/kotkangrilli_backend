// app.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const { Model } = require('objection');
const Knex = require('knex');
const knexConfig = require('./knexfile');
const passport = require('./controllers/authController');
const authMiddleware = require('./middleware/authMiddleware');

const gameRoutes = require('./routes/gameRoutes');

dotenv.config();

const app = express();
const knex = Knex(knexConfig.development);

// Bind all Models to the knex instance
Model.knex(knex);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require('./routes/authRoutes');

app.use('/auth', authRoutes);

app.use('/api', gameRoutes);

app.get('/', (req, res) => {
  res.send('<a href="/auth/discord">Login with Discord</a>');
});

app.get('/dashboard', authMiddleware.ensureAuthenticated, (req, res) => {
  res.send(`Hello, ${req.user.username}! Welcome to your dashboard.`);
});

// Bypass middleware for API testing purposes
app.get('/api/dashboard', (req, res) => {
  res.send('Welcome to the API dashboard!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
