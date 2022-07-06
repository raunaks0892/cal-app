const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require("dotenv");
dotenv.config();



// const GOOGLE_CLIENT_ID= "433352591015-rdapuj2teu5vujprhsevbfed4j0fnr6i.apps.googleusercontent.com";
// const GOOGLE_CLIENT_SECRET= "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"; 
// const callbackurl_local = "http://localhost:3004/auth/google/callback";
//const callbackurl_server = "https://d09a-2405-204-51ad-5afe-f938-9763-8d0b-1826.in.ngrok.io/auth/google/callback";


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("profile details : -->"+profile);
    done(null, profile);
    //console.log("authentication completed using google startegy : "+profile._json+" name : "+profile.displayName);
    //return done(null, profile);
  }
));

passport.serializeUser((user,done)=>{
    done(null, user);
    console.log("user details serializeUser:->"+user);
})

passport.deserializeUser((user,done)=>{
    done(null, user);
    console.log("user details deserializeUser:->"+user);
})

module.exports = passport;