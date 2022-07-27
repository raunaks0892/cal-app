const mangoose = require("mongoose");

const user = new mangoose.Schema({
    username:{
        type: String,
        unique: true
    },
    password: String
    
})

//module.export = mangoose.model({"User":user});
module.exports = mangoose.model("User", user);