const session = require("express-session")
//const cookieSession = require("cookie-session");
const cookieParser = require('cookie-parser');
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const passportSetup = require("./passport");    
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const authRoute = require("./routes/auth");
const dotenv  = require("dotenv");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./user");
const config = require("./config.json");
const user = require("./user");

const app = express();
app.use(bodyParser.json());
const port = "3004";

var CLIENT_URL= "";
var CLIENT_LOGIN= "";
var CLIENT_CORS= ""

//uncomment session data, sameSite: "none", secure: true

if(config.credData.mode=="DEV"){
    CLIENT_URL = config.credData.CLIENT_URL_LOCAL;
    CLIENT_LOGIN = config.credData.CLIENT_LOGIN_LOCAL;
    CLIENT_CORS = config.credData.CLIENT_CORS_LOCAL;
}else{
    CLIENT_URL = config.credData.CLIENT_URL_SERVER;
    CLIENT_LOGIN = config.credData.CLIENT_LOGIN_SERVER;
    CLIENT_CORS = config.credData.CLIENT_CORS_SERVER;
}

console.log("CLIENT_URL:->"+CLIENT_URL+" CLIENT_LOGIN:->"+CLIENT_LOGIN+" CLIENT_CORS:->"+CLIENT_CORS);

mongoose.connect("mongodb+srv://raunaks0892:8123338798@cluster0.fi5d7.mongodb.net/cal_user?retryWrites=true&w=majority",{
    //useCreateIndex: true,
    useNewUrlParser: true, 
    useUnifiedTopology: true,

},(err)=>{
    if(err) throw err;
    console.log("connected to mongoose database successfully!");
})


dotenv.config();

console.log('hello');

app.set("trust proxy", 1);

app.use(
    session({
      secret: "secretcode",
      resave: true,
      saveUninitialized: true,
      cookie:{
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // One Week
      }
    }))

// app.use(cookieSession(
//     {
//         name:"session",
//         keys: ['calendar'],
//         maxAge: (24*60*60*1000)*7,//one week
//         // sameSite: "none",
//         // secure: true
        
//     }
// ))

app.use(cookieParser('secretcode'));

app.use(passport.initialize());
app.use(passport.session());
app.use(cors(
    {
    origin: CLIENT_CORS,
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
    res.redirect(CLIENT_URL);
  });

app.get("/",(req,res)=>{
    
    //res.redirect(CLIENT_LOGIN);
    res.send("Authentication server working fine");
})

app.get("/login/failed",(req,res)=>{
    res.status(401).json({
        success: false,
        message: "something went wrong"
    });
})

app.get("/auth/logout",(req,res)=>{
    req.logOut();
    //res.redirect(CLIENT_LOGIN);
    res.redirect(CLIENT_LOGIN);
})

app.get("/auth/getUser",(req,res)=>{
    console.log("getuser : "+req.user)
    res.send(req.user);
})

//app.post("/login",passport.authenticate('local',{failureRedirect:'/login/failed'}));

app.post("/login",(req, res, next)=>{ 
    console.log("Start user Authentication: "+req.body.username);
    // const user = {
    //     username: req.body.username,
    //     password: req.body.password
    // }
passport.authenticate("local",{successRedirect:'/'},(err,user,info)=>{
    console.log("Inside Passport Authentication process :"+user);
    if (err) throw err;
    if(!user) res.send("No User Exists");
    else{
        req.logIn(user, (err)=>{
            if(err) throw err;
            //res.send(CLIENT_URL);
            //res.redirect(CLIENT_URL);
            res.send("Successfully Authenticated");
            console.log("Successfully Authenticated..."+req.user);
            //res.redirect(CLIENT_URL);
        })
    }
})(req,res,next);
});

// app.post("/login", async(req,res)=>{
//     const {username, password} = req.body;
//     if(!username||!password){
//         console.log("Please provide username and password");
//         res.send("Please provide username and password")
//     }
//     //const hashedPassword = await bcrypt.hash(password,10);
//     User.findOne({username},async (err, userData)=>{
//         if(err) {
//             throw err;
//         }
//         if(userData){
//             const valid = await bcrypt.compare(password, userData.password);
//             console.log("valid : "+valid);
//             if(!valid){
//                 res.send("Password is wrong!!");
//                 return;
//             }
//             //res.redirect('/');
//             //res.send("user found..success!!");
//             res.send(userData);
//         }else{
//             res.send("User not dound");
//         }
//     })
// })


app.post("/register",async (req,res)=>{
    //console.log("username from request : "+req.body.username+" password from request : "+req.body.password);

    const {username, password} = req.body;
    if(!username || !password || typeof(username)!== "string" || typeof(password)!== "string"){
        //console.log("Improper user input");
        res.send("Improper user input");
        return;
    }

    User.findOne({username},async (err, doc)=>{
        if(err) throw err;
        if(doc) res.send("User already exists");
        if(!doc){
            const hashedPassword = await bcrypt.hash(req.body.password,10);
    
            const newUser = new User({
                username,
                password: hashedPassword
            })
            await newUser.save();
            
            res.send("User created successfully");

        }
    })   
})

app.get("/userFromDB", async(req,res)=>{
    const {username, password} = req.body;
    if(!username||!password){
        //console.log("Please provide username and password");
        res.send("Please provide username and password")
    }
    //const hashedPassword = await bcrypt.hash(password,10);
    User.findOne({username},async (err, userData)=>{
        if(err) {
            throw err;
        }
        if(userData){
            const valid = await bcrypt.compare(password, userData.password);
            console.log("valid : "+valid);
            if(!valid){
                res.send("Password is wrong!!");
                return;
            }
            res.send("user found..success!!");
        }else{
            res.send("User not dound");
        }
    })
})

app.post("/updatePassword",async (req,res)=>{
    const {username, password} = req.body;
    if(!username||!password){
        //console.log("Please provide username and password");
        res.send("Please provide username and password")
    }
    const hashedPassword = await bcrypt.hash(password,10);
    User.updateOne({username},{hashedPassword},(err,userData)=>{
        if(err) {
            //console.log("update password err : "+err);
            throw err;
        }
        if(userData){
            res.send("Password Updated Successfully!!");

        }else{
            res.send("User Not Found");
        }
    })
})


app.listen(process.env.PORT || port,()=>{
    console.log(`Server is listing at port ${port}`);
})
