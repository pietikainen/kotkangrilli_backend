// routes/authRoutes.js
const express = require('express');
const passport = require('../controllers/authController');
const router = express.Router();

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('http://localhost:3000/dashboard');
  }
);

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      if (err) { return next(err); }
      res.clearCookie('connect.sid').status(200).json({ message: 'Logged out successfully' });
    });
  });
});

module.exports = router;