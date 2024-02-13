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
          newUser.Email = ""
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
     

     
     if (!matchPass) 
     {
          console.log("wrong password");
          return res.sendStatus(403);
     }

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
  
//######## User Administration ########//
app.patch("/forgotPassword", async (req, res) => {
     let email = req.body.email
     let username = req.body.username

     const user = await User.findOne({Username: username, Email: email})

     if(user)
     {
          // create random password 
          // email the new password to the given email
     }
     else
     {
          res.sendStatus(403)
     }
});

app.patch("/changeUsername", async(req, res) => {
     let email = req.body.email
     let password = req.body.password
     let username = req.body.username
     let newUsername = req.body.newUsername

     const user = await User.findOne({Username: username, Email: email, Password: password})

     user.username = newUsername
     await user.save()

     const projects = user.Projects
     
     for (let i = 0; i < projects.length; i ++)
     {
          CurrentProjectId = projects[i]
          CurrentProject = await Project.findOne({_id: CurrentProjectId})
          for(let x = 0; x < CurrentProject.Team; x++)
          {
               if(CurrentProject.Team[x] == username)
               {
                    CurrentProject.Team[x] = newUsername
                    break
               }
               else if( x < CurrentProject.Owners.length)
               {
                    if(CurrentProject.Owners[x] == username)
                    {
                         CurrentProject.Owners[x] = newUsername
                         break
                    }
               }
          } 
          await CurrentProject.save()
     }
})

app.patch("/changePassword", async(req, res) => {
     // patch
     // if from link take userID
     // find user with userID and change password to new password
     // if from profile take username and email and password to change password
     // find user with username, email check oldpassword and change to new password
          
})

app.patch("/addFriend", async(req, res) => {
     let username = req.body.username
     let friend = req.body.user
     let token = req.body.token

     let user = await User.findOne({Username: username, Token: token})

     if(user)
     {
          user.Friends = [...user.Friends, friend]
     }
     else
     {
          res.send(403)
     }

})

app.patch("/addTeam", async(req, res) => {
     // patch
     // check username in project owner
     // add user to projects team
})

app.patch("/addOwner", async(req, res) => {
     // patch
     // check username in project owner
     // add user to projects owners and remove from team    
})
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