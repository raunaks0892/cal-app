const router = require("express").Router();
const passport = require("passport");

//const CLIENT_URL = "https://95cc-2405-204-51ad-5afe-a540-d9a9-e056-cfd1.eu.ngrok.io/calendar"
//const CLIENT_LOGIN = "https://95cc-2405-204-51ad-5afe-a540-d9a9-e056-cfd1.eu.ngrok.io/login";
const CLIENT_URL = "http://localhost:3000/calendar";
const CLIENT_LOGIN = "http://localhost:3000";

router.get("/login/success",(req,res)=>{
    //console.log("trying to access user details:->"+req.user+", url:-> "+req.baseUrl+" "+req.body+" "+req.hostname);
    

    if(req.user){
        res.status(200).json({
            success: true,
            message: "successfull",
            user: req.user

        });
        console.log("Got user details");
    }
})

// router.get("/getUser",(req,res)=>{
//     console.log("getuser : "+req.user)
//     res.send(req.user);
// })
router.get("/login/failed",(req,res)=>{
    res.status(401).json({
        success: false,
        message: "something went wrong"
    });
})

router.get("/logout",(req,res)=>{
    req.logOut();
    res.redirect(CLIENT_LOGIN);
})

router.get("/google", passport.authenticate("google",{scope:['profile']}))

router.get("/google/callback", passport.authenticate("google",{
    successRedirect: CLIENT_URL,
    //successRedirect: "/successfully/",
    failureRedirect: "/login/failed"
}))

router.get("/successfully/",(req,res)=>{

    //console.log("success authenticated"+req.user);
    res.send("success authenticated");
})



module.exports = router