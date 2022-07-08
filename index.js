//const cookieSession = require("express-session")
const cookieSession = require("cookie-session");
const passport = require("passport");
const passportSetup = require("./passport");    
const cors = require("cors");
const express = require("express");
const authRoute = require("./routes/auth");
const dotenv  = require("dotenv");

const app = express();
const port = "3004";

const CLIENT_URL = "http://localhost:3000/calendar";
const CLIENT_LOGIN = "http://localhost:3000";

const CLIENT_URL_SERVER = "https://62c7d40e90d2434bda6278e3--lively-otter-b22b3d.netlify.app/calendar";
const CLIENT_LOGIN_SERVER = "https://62c7d40e90d2434bda6278e3--lively-otter-b22b3d.netlify.app";

dotenv.config();

console.log('hello');

app.set("trust proxy", 1);

app.use(cookieSession(
    {
        name:"session",
        keys: ['calendar'],
        maxAge: (24*60*60*1000)*7,//one week
        sameSite: "none",
        secure: true
        
    }
))

app.use(passport.initialize());
app.use(passport.session());
app.use(cors(
    {
    origin: ["http://localhost:3000", "https://62c7d40e90d2434bda6278e3--lively-otter-b22b3d.netlify.app"],
    method: "GET,POST,PUT,DELETE",
    credentials: true
}
// ,
// {
//     origin: "https://0250-2405-204-51ad-5afe-a072-de2d-5e00-165a.in.ngrok.io",
//     method: "GET,POST,PUT,DELETE",
//     credentials: true
// }
))

//app.use("/auth", authRoute);

app.get("/auth/google", passport.authenticate("google",{scope:['profile']}))

// app.get("/auth/google/callback", passport.authenticate("google",{
//     successRedirect: CLIENT_URL,
//     //successRedirect: "/successfully/",
//     failureRedirect: "/login/failed"
// }))
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login/failed', session: true }),
  function (req, res) {
    //res.redirect(CLIENT_URL);
    res.redirect(CLIENT_URL_SERVER);
  });

app.get("/",(req,res)=>{
    res.send("Authentication server working fine");
})

// app.get("auth/login/success",(req,res)=>{
//     //console.log("trying to access user details:->"+req.user+", url:-> "+req.baseUrl+" "+req.body+" "+req.hostname);
    

//     if(req.user){
//         res.status(200).json({
//             success: true,
//             message: "successfull",
//             user: req.user

//         });
//         console.log("Got user details");
//     }
// })
app.get("/login/failed",(req,res)=>{
    res.status(401).json({
        success: false,
        message: "something went wrong"
    });
})

app.get("/logout",(req,res)=>{
    req.logOut();
    //res.redirect(CLIENT_LOGIN);
    res.redirect(CLIENT_LOGIN_SERVER);
})

app.get("/auth/getUser",(req,res)=>{
    console.log("getuser : "+req.user)
    res.send(req.user);
})

app.listen(process.env.PORT || port,()=>{
    console.log(`Server is listing at port ${port}`);
})
