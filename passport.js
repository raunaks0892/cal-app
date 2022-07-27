const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./user");
//const { findById } = require('./user');
dotenv.config();
var google_authentication = false;


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("profile details : -->"+profile);
    google_authentication = true;
    done(null, profile);
    console.log("authentication completed using google startegy : "+profile._json+" name : "+profile.displayName+" google_authentication:"+google_authentication);
    //return done(null, profile);
  }
));

passport.use(new LocalStrategy((username,password,done)=>{
  console.log("passport local -----username: "+username+" password: "+password);
  User.findOne({username},async (err, userData)=>{
    if(err) {
        throw err;
    }
    if(userData){
        const valid = await bcrypt.compare(password, userData.password);
        console.log("valid : "+valid);
        if(!valid){
            //res.send("Password is wrong!!");
            return done(null, false);
        }
        google_authentication = false;
        console.log("google_authentication : "+google_authentication);
        return done(null, userData);
        //res.send("user found..success!!");
    }else{
      return done(null, false);
        //res.send("User not dound");
    }
})
}))

  passport.serializeUser((user,done)=>{
    //done(null, user);
    done(null, user);
    console.log("user details serializeUser:->"+user.displayName);
})


passport.deserializeUser((storeduser,done)=>{
  console.log("Deserialization Started: "+google_authentication);
  if(!google_authentication){
    console.log("using local validation");
    User.findOne(storeduser,(err,user)=>{
      if(err) throw err;
      const userInfo = {
        username: user.username,
      };
      console.log("user details deserializeUser:->"+userInfo.username);
      done(err,userInfo)
    })

  }else{
    console.log("using google validation")
    const userInform = {
      username: storeduser.displayName,
    };
    done(null, userInform);
    console.log("user details deserializeUser:->"+userInform);
  }
  
})



module.exports = passport;