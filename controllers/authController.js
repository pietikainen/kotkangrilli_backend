// controllers/authController.js
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User'); // Correctly importing the User model

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {

    const user = await User.query().insert({
      snowflake: profile.id,
      username: profile.username,
      email: profile.email,
      avatar: profile.avatar,
      userlevel: 1
    }).onConflict('snowflake').merge(['username', 'email', 'avatar', 'updated_at']);

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.query().findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
