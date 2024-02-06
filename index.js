const express = require("express");
const mongoose = require("mongoose");
const { Project } = require("./models/project");
const { User } = require("./models/user");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const cors = require("cors");

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err.message);
  });

// defining the Express app
const app = express();

app.use(cors());
app.use(express.json());

//############ CheckUser ##############//
app.get("/username/:usernameValue", async (req, res) =>
{
     const value = req.params.usernameValue
     const user = await User.findOne({ Username: value });
     console.log("Potato")
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

//############ create user ############//
app.post("/signup", async (req, res) => {
     let newUser = req.body;
     newUser.PFP = ""
     newUser.Bio = "Bio"
     console.log(newUser)
     const user = new User(newUser);
     console.log("Created an user")
     console.log(user)
     await user.save();
     res.send({ message: "New User Created." });
});
//#####################################//

//# Authorization generation endpoint #//
app.post("/auth", async (req, res) => {
     console.log("arrived");
     console.log(req.body);
     const user = await User.findOne({ username: req.body.username });
     if (!user) 
     {
          return res.sendStatus(403);
     }

     // do not store password in plain text
     if (req.body.Password !== user.Password) 
     {
          console.log("wrong password");
          return res.sendStatus(403);
     }
     // code to generate token
     user.Token = uuidv4();
     await user.save();
     res.send({ Token: user.Token });
     //create expiredate
     //user.ExpireDate = new Date
});
//#####################################//

//##### Authorization middleware ######//
app.use(async (req, res, next) => {
     const authHeader = req.headers["authorization"];
     const user = await User.findOne({ token: authHeader });
     if (user) 
     {
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

//######## PROJECT STUFF HERE #########//

//#####################################//

//####### starting the server #########//
app.listen(
  3000, 
  () => {
  console.log("listening on port 3000");
});
//#####################################//