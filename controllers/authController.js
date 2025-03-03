// controllers/authController.js
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const axios = require('axios');
const User = require('../models/User'); // Correctly importing the User model

const TARGET_GUILD_ID = process.env.DISCORD_SERVER_ID;

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify', 'email', 'guilds.members.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let nickname = profile.global_name;

    // fetch guild membership data for the nickname
    const guildMemberUrl = `https://discord.com/api/v10/users/@me/guilds/${TARGET_GUILD_ID}/member`;
    const headers = { Authorization: `Bearer ${accessToken}` };

    try {
      const guildMemberResponse = await axios.get(guildMemberUrl, { headers });
      if (guildMemberResponse.data && guildMemberResponse.data.nick) {
        nickname = guildMemberResponse.data.nick;
      }
    } catch (error) {
      console.warn(`Failed to fetch guild member data:`, error.response?.data || error.message);
      console.log('error: ', error);
    }
    const user = await User.query().insert({
      snowflake: profile.id,
      username: profile.username,
      nickname: nickname,
      email: profile.email,
      avatar: profile.avatar,
      userlevel: 1
    }).onConflict('snowflake').merge(['username', 'email', 'avatar', 'nickname', 'updated_at']);
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
