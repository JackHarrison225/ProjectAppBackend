

const { User } = require("../models/user");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');
const saltRounds = 10;


//############ CheckUser ##############//
exports.checkUser = async function (req, res) {
     const value = req.params.usernameValue
     const user = await User.findOne({ Username: value });
     console.log("This is the current user", user)
     if(user)
     {
          res.send(true)
          // return true
     }
     else
     {
          res.send(false)
          // return false
     }
}
//#####################################//


//########### CheckToken ##############//
exports.checkToken = async function (req, res) {
     console.log("Checking Token")
     const value = req.params.Token
     console.log("Token value received for verification", value)
     const token = await User.findOne({ Token: value });
     console.log("Token in the database", token.Token)
     if(!token)
     {
          res.send(false)
          // return false         
     }
     else
     {
          console.log("Valid")
          res.send(true)
          // return true
     }
}
//#####################################//


//# Authorization generation endpoint #//
exports.userLogin = async function (req, res) {
    console.log("User arrived");
    const user = await User.findOne({ Username: req.body.Username });
    if (!user) 
    {
         return res.sendStatus(403);
    }
    const Input = req.body.Password
    const Database = user.Password
    let matchPass = await bcrypt.compare(Input, Database);

    if (!matchPass) 
    {
         console.log("wrong password");
         return res.sendStatus(403);
    }

    user.Token = uuidv4();
    console.log("Make token")
    console.log(user.Token)
   
    await user.save();
    res.send({Token: user.Token, UserId: user._id, message: "Login Successful!"}, )


    //create expiredate
    //user.ExpireDate = new Date
};
//#####################################//


//############ create user ############//
exports.userSignUp = async function (req, res) {
    let newUser = req.body;
    
    let Password = req.body.Password
    
    bcrypt.genSalt(saltRounds, function(err, salt) {  
         bcrypt.hash(Password, salt, async function(err, hash) {
         newUser.Password = hash
         newUser.PFP = ""
         newUser.Bio = "Bio"
         newUser.Email = ""
         const user = new User(newUser);
         console.log("Created a user")
         await user.save();
         res.send({ message: "New User Created." });
         });
    });
    
};
//#####################################//


