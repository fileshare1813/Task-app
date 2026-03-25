const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
  // Local Strategy
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: 'Email not registered' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Incorrect password' });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

 // Google Strategy
passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Email check karo pehle
      const email = profile.emails && profile.emails[0] 
        ? profile.emails[0].value 
        : null;

      if (!email) {
        return done(null, false, { message: 'Google account me email nahi mili' });
      }

      // Pehle email se dhundho (agar local account hai)
      let user = await User.findOne({ 
        $or: [{ googleId: profile.id }, { email: email }] 
      });
      
      if (user) {
        // Agar user mila par googleId nahi hai, update karo
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
      } else {
        // Naya user banao
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: email
        });
      }
      
      return done(null, user);
    } catch (err) {
      console.error('Google auth error:', err);
      return done(err);
    }
  })
);

  // Session serialization
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
