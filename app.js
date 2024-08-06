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
const userRoutes = require('./routes/userRoutes');

app.use('/auth', authRoutes);

app.use('/api', gameRoutes);

app.use('/user', userRoutes);

app.get('/', (req, res) => {
  res.send('<a href="/auth/discord">Login with Discord</a>');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
