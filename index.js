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
          console.log("Valid")
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
app.get("/user/:id", async (req, res) =>{
     const user = await Project.findById(req.params.id);

     if(user)
     {
          res.send(user)
     }
     else
     {
          res.send(404)
     }
})

app.patch("/forgotPassword", async (req, res) => {
     let email = req.body.email
     let username = req.body.username

     const user = await User.findOne({Username: username, Email: email})

     if(user)
     {
          // create random password 
          newPassword = generatePassword(() => {
               x = false
               let password = ""
               while(x == false)
               {    
                    isRight = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{6}$/g.test(password)
                    if(isRight)
                    {
                         x = true
                    }
               }
               return password
          })
          // email the new password to the given email
          // user.password = new password save user
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
     const newUser = await User.find({Username: newUsername})
     if(user && !newUser){
          user.username = newUsername
          await user.save()
     }
     else
     {
          res.sendStatus(403)
     }

})

app.patch("/changePassword", async(req, res) => {
     let email = req.body.email
     let password = req.body.password
     let username = req.body.username
     let newPassword = req.body.newPassword

     const user = await User.findOne({Username: username, Email: email, Password: password})
     if(user)
     {
          user.password = newPassword
          await user.save()
     }
     else
     {
          res.sendStatus(403)
     }
})

app.patch("/addFriend", async(req, res) => {
     let username = req.body.Username
     let friend = req.body.Friendname
     let token = req.body.token

     let user = await User.findOne({Username: username, Token: token})
     let newFriend = await User.findOne({Username: friend})

     if(user && newFriend)
     {
          user.Friends = [...user.Friends, newFriend._id]
          newFriend.Friends = [...newFriend.Friends, user._id]
          await user.save()
          await newFriend.save()
     }
     else
     {
          res.send(403)
     }
})
//#####################################//

//###### Project Administration #######//
app.get("/projects", async(req, res) => {
     let AllProjects = await Project.find()
     console.log(AllProjects)
     res.send(AllProjects)
})

app.post("/CreateProject", async (req, res) => {
     let SentToken = req.body.token
     console.log(SentToken)
     
     let owner = await User.findOne({ Token: SentToken });

     if(owner)
     {
          console.log("Owner Object")
          console.log(owner)
          const projectObject = {
               Title: req.body.title,
               Tags: [...req.body.tags],
               description: req.body.description,
               Owners: [owner._id],
               Picture: req.body.picture
          }
          console.log(projectObject)
          const project = new Project(projectObject)
          console.log("Project Created")
          await project.save();
          res.send(true)
     
     }
     else
     {
          res.send(403)
     }
});

app.patch("/addTeam", async(req, res) => {
     const projectID = req.body.ProjectID
     const owerID = req.body.OwnerID
     const userID = req.body.UserID

     const project = await Project.findOne({_id: projectID})
     const user = await User.findOne({_id: userID })

     if(project && user)
     {
          let added = false
          for( let i = 0; i < project.Owners.length; i++ )
          {
               if(project.Owners[i] == owerID)
               {
                    added = true
                    project.Team = [...project.Team, userID]
                    await project.save()
               }
               else if(project.Owners[i] == owerID)
               {
                    project.Owners.splice(i,0)
                    await project.save()
               }
          }
          if(added == false)
          {
               res.send(403)
          }
          else
          {
               res.send("Added")
          }
     }
     else
     {
          res.send({status : 404, message: "No user or project"})
     }
})

app.patch("/addOwner", async(req, res) => {
     // patch
     const projectID = req.body.ProjectID
     const owerID = req.body.OwnerID
     const userID = req.body.UserID

     
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
          Description: req.body.description,
          Owners: [owner.Username],
          Picture: req.body.picture
     }
     else
     {
          res.send({status : 404, message: "No user or project"})
     }   
})


});

app.patch("/updateproject", async (req, res) => {
     let project = await Project.findOne({_id: req.body.id});
     if (project) {
          project.Title = req.body.title;
          project.Tags = req.body.tags;
          project.Description = req.body.description;
          project.Picture = req.body.picture;
          await project.save()
     } else {
          res.send(403)
     }

     console.log("Updated!")
console.log("Found id")
})

app.delete("/deleteproject/:id", async (req, res) => {
try {
     await Project.findByIdAndDelete(req.params.id);
     console.log("Deleted!")
} catch (error) {
     console.log(error)
}
console.log("Found id")
})


//#####################################//

//####### starting the server #########//
app.listen(
  3000, 
  () => {
  console.log("listening on port 3000");
});
//#####################################//