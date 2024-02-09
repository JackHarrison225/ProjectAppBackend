const express = require("express");
const mongoose = require("mongoose");

const { Project } = require("./models/project");
const { User } = require("./models/user");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

const cors = require("cors");

const bcrypt = require('bcrypt');
const saltRounds = 10;

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err.message);
  });

const app = express();

app.use(cors());
app.use(express.json());

//############ CheckUser ##############//
app.get("/username/:usernameValue", async (req, res) =>
{
     const value = req.params.usernameValue
     const user = await User.findOne({ Username: value });
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
})
//#####################################//

//########### CheckToken ##############//
app.get("/Token/:token", async (req, res) =>
{
     console.log("Checking Token")
     const value = req.params.token
     const token = await User.findOne({ Token: value });
     if(!token)
     {
          res.send(false)
          // return false         
     }
     else
     {
          res.send(true)
          // return true
     }
})
//#####################################//

//############ create user ############//
app.post("/signup", async (req, res) => {
     let newUser = req.body;
     
     let Password = req.body.Password
     
     bcrypt.genSalt(saltRounds, function(err, salt) {  
          bcrypt.hash(Password, salt, async function(err, hash) {
          newUser.Password = hash
          newUser.PFP = ""
          newUser.Bio = "Bio"
          const user = new User(newUser);
          console.log("Created a user")
          await user.save();
          res.send({ message: "New User Created." });
          });
     });
     
     
});
//#####################################//

//# Authorization generation endpoint #//
app.post("/auth", async (req, res) => {
     console.log("User arrived");
     const user = await User.findOne({ Username: req.body.Username });
     if (!user) 
     {
          return res.sendStatus(403);
     }
     const Input = req.body.Password
     const Database = user.Password
     let matchPass = await bcrypt.compare(Input, Database);
     

     // do not store password in plain text
     if (!matchPass) 
     {
          console.log("wrong password");
          return res.sendStatus(403);
     }
     // code to generate token
     user.Token = uuidv4();
     console.log("Make token")
     await user.save();
     res.send({Token: user.Token})
     //create expiredate
     //user.ExpireDate = new Date
});
//#####################################//

//##### Authorization middleware ######//
app.use(async (req, res, next) => {
     console.log("AuthCall")
     const authHeader = req.headers["authorization"];
     const user = await User.findOne({ Token: authHeader });
     if (user) 
     {
          console.log("Valid Token")
          
          //check expiredate 
          //if fine next
          //if not remove token 

          next();
     } 
     else {
          return res.sendStatus(403);
     }
});
//#####################################//

//###### Project Administration #######//
app.post("/CreateProject", async (req, res) => {
     let SentToken = req.body.token
     console.log(SentToken)
     let owner = await User.findOne({ Token: SentToken });
     console.log("Owner Object")
     console.log(owner)
     const projectObject = {
          Title: req.body.title,
          Tags: [...req.body.tags],
          description: req.body.description,
          Owners: [owner.Username],
          Picture: req.body.picture
     }
     console.log(projectObject)
     const project = new Project(projectObject)
     console.log("Project Created")
     await project.save();
     res.send(true)
});
//#####################################//

//####### starting the server #########//
app.listen(
  3000, 
  () => {
  console.log("listening on port 3000");
});
//#####################################//