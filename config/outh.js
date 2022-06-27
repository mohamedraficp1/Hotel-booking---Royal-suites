const passport= require('passport')
const GOOGLE_CLIENT_ID = '95907055277-hv4r41u8mt8v3ng417kutq8osjoaoq3c.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

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