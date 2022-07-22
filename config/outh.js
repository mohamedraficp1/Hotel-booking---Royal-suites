require('dotenv').config()
const passport= require('passport')
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_IDS;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRETS;

var GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:6001/google/callback",
    passReqToCallback: true
  },
  function(request,accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
  }
));

passport.serializeUser(function(user,done){
    done(null,user)
})

passport.deserializeUser(function(user,done){
    done(null,user)
})