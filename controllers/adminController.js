const { Project } = require("../models/project");
const { User } = require("../models/user");




//###### Project Administration #######//
exports.getCreatedProjects = async function (req, res) {
   
    const userId = req.params.id;
    let userProjects = await Project.find({ Creator : userId})
    console.log("Created Projects for userid", userId, ":", userProjects)
    res.send(userProjects)
//     let AllProjects = await Project.findById(req.params.id)
//     console.log("This should contain projects by id", AllProjects)
//     res.send(AllProjects)
}

exports.removeProject = async function(req, res) {
     const { projectId, categoryName} = req.body;
     const {user} = req
     console.log("Trying to remove project", projectId, "from", categoryName)


     if (!user) {
          return res.status(404).send({message: "User not found"})
     }
     if (!categoryName || !projectId)  {
          return res.status(400).send({ message: "Project ID and category are required." });
     }

     try {
          if (user[categoryName]) {
               const index = user[categoryName].indexOf(projectId);
               if (index > -1) {
                    user[categoryName].splice(index, 1);
                    await user.save()
                    res.send({message: "project removed successfully from " + categoryName})
               } else {
                    res.status(404).send({message: "Project nto found in " + categoryName})
               }
          } else {
               res.status(400).send({messge: "Invalid Category"})
          }

     } catch(error) {
          console.error(`Error removing project from category`)
          return res.status(500).send({message: "Error removing project from category"})
     }



}

exports.getSavedProjects = async function(req, res) {

     const userId = req.params.id;
     try {
          const userWithSavedProjects = await User.findById(userId).populate('SavedProjects')

          if (!userWithSavedProjects) {
               return res.status(404).send({message: "User not found"})
          }

          let savedProjects = userWithSavedProjects.SavedProjects;
          console.log(`Saved Projects for ${userId} are: ${savedProjects}`)
          res.send(savedProjects)

     } catch(error) {
          console.error(`Error retrieving saved projects for user ${userId}`, error)
          res.status(500).send({message: "Error retrieving saved projects"})
     }

}

exports.getFavouriteProjects = async function(req, res) {

     const userId = req.params.id;
     
     try {

          const userWithFavouriteProjects = await User.findById(userId).populate('FavouriteProjects');

          if(!userWithFavouriteProjects) {
               res.status(404).send({message: "User not found"})
          }
          const favouriteProjects = userWithFavouriteProjects.FavouriteProjects
          console.log(`Favourite projects for ${userId} are: ${favouriteProjects}`)
          res.send(favouriteProjects)

     }catch(error) {
          console.error(`Error retrieving favourite projects for ${userId}`, error)
          res.status(500).send({message: "Error retrieving favourite projects"})
     }
}

exports.getOngoingProjects = async function(req, res) {

     const userId = req.params.id;
     try {
          const userWithOngoingProjects = await User.findById(userId).populate('OngoingProjects')

          if(!userWithOngoingProjects) {
               res.status(404).send({message: "User not found"})
          }

          const ongoingProjects = userWithOngoingProjects.OngoingProjects
          console.log(`On going projects for ${userId} are: ${ongoingProjects}`)
          res.send(ongoingProjects)

     }catch(error) {
          console.error(`Error retrieving user ${userId} ongoing projects`, error)
          res.status(500).send({message: "Error retrieving user ongoing projects"})
     }
}



exports.createProjects = async function (req, res) {
    let SentToken = req.body.Token
    console.log("This is the sent token:", SentToken)

    const creator = req.user;

    console.log("The owner is:", creator)

    if(creator)
    {
         console.log("Owner Object")
         console.log(creator)
         const projectObject = {
              Title: req.body.Title,
              Tags: req.body.Tags,
              Description: req.body.Description,
              Owners: [creator._id],
              Picture: req.body.Picture,
              Creator: creator._id
         }
         console.log("This should be a projectObject:", projectObject)
         const project = new Project(projectObject)
         console.log("Project Created")
         await project.save();

         creator.CreatedProjects.push(project)
         await creator.save()

         console.log("Project Created and added to the user");
         res.send(true)
    
    }
    else
    {
     res.status(403).send({ message: "Owner not found" });
    }
};

exports.addToFavouriteProject = async function(req, res) {
     const {user} = req;
     let sentToken = req.body.Token
     const projectId = req.params.id
     
     try {

   
          (console.log(`The user ${user} is adding to their favourite projects`))
          if (!user) {
               return res.status(404).send({message: "user not found"})
          }

          const project = await Project.findById(projectId)
          if (!project) {
               return res.status(404).send({message: "project not found"})
          }

          const projectIdString = project._id.toString();

          const isDuplicate = user.FavouriteProjects.some(favouriteProjectId => favouriteProjectId.toString === projectIdString)

          if (isDuplicate) {
               return res.status(400).send({message: "Project is already in favourites."})
          } else {
               user.FavouriteProjects.push(project)
               await user.save()
               res.send({message: "Project added to favourites succesfully"})
          }

     } catch(error) {
          console.error("Error adding project to favourites", error)
          res.status(500).send({message: "Error adding project to favourites"})
     } 


}

exports.addToSavedProject = async function (req, res) {

     const {token, user} = req;
     // let SentToken = req.body.Token
     console.log("This should hold the user token:", token)
     const projectId = req.params.id
     
     try {

          // const user = await User.findOne({ Token: SentToken })
          (console.log(`The user ${user.Username} is adding to their saved projects`))
          if (!user) {
               return res.status(404).send({message: "user not found"})
          }

          const project = await Project.findById(projectId)
          if (!project) {
               return res.status(404).send({message: "project not found"})
          }

          const projectIdString = project._id.toString();

          const isDuplicate = user.SavedProjects.some(savedProjectId => savedProjectId.toString() === projectIdString)

          if (isDuplicate) {
               return res.status(400).send({message: "Project is already in saved projects."})
          } else {
               user.SavedProjects.push(project._id)
               await user.save()
               res.send({message: "Project added to saved projects succesfully"})
               console.log(`The user ${user.Username} has successfully added a project to their saved projects.`)
          }

     } catch(error) {
          console.error("Error adding project to saved projects", error)
          res.status(500).send({message: "Error adding project to saved projects"})
     } 
}

exports.addToOnGoingProject = async function (req, res) {
     const {user} = req.user;
     const projectId = req.params.id;
     
     try {

       
          (console.log(`The user ${user} is adding to their ongoing projects`))
          if (!user) {
               return res.status(404).send({message: "user not found"})
          }

          const project = await Project.findById(projectId)
          if (!project) {
               return res.status(404).send({message: "project not found"})
          }

          const projectIdString = project._id.toString();

          const isDuplicate = user.OngoingProjects.some(ongoingProjectId => ongoingProjectId.toString === projectIdString)

          if (isDuplicate) {
               return res.status(400).send({message: "Project is already in ongoing projects."})
          } else {
               user.OngoingProjects.push(project)
               await user.save()
               res.send({message: "Project added on going projects succesfully"})
          }

     } catch(error) {
          console.error("Error adding project to ongoing projets", error)
          res.status(500).send({message: "Error adding project to ongoing projects"})
     } 
}

exports.addToTeam = async function (req, res) {
    const projectID = req.body.ProjectID
    const ownerID = req.body.OwnerID
    const userID = req.body.UserID

    const project = await Project.findOne({_id: projectID})
    const user = await User.findOne({_id: userID })

    if(project && user)
    {
         let added = false
         for( let i = 0; i < project.Owners.length; i++ )
         {
              if(project.Owners[i] == ownerID)
              {
                   added = true
                   project.Team = [...project.Team, userID]
                   await project.save()
              }
              else if(project.Owners[i] == ownerID)
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
}

exports.addProjectOwner = async function (req, res) {
    // patch
    const projectID = req.body.ProjectID
    const owerID = req.body.OwnerID
    const userID = req.body.UserID

    
//###### Project Administration #######//
};


exports.updateProject = async function (req, res) {
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
}

exports.deleteProject = async function(req, res) {
try {
    const sentToken = req.body.Token;
    const projectId = req.params.id;

    let deletor = await User.findOne({Token: sentToken})
    
  

    if(!deletor) {
          return res.status(404).json({message: "User not found."})
     }

     const projectToDelete = await Project.findById(projectId);

     if(!projectToDelete) {
          return res.status(404).json({message: "Project not found"})
     }

     if (projectToDelete.Creator.includes(deletor._id)) {
          await Project.findByIdAndDelete(projectId);
          console.log("Project deleted!")
     

     await User.updateMany (
          {}, // empty object means match all documents, scans through all documents so might prove to be efficient. 
          { $pull: {Projects: projectId}}
     );
     
     console.log("Project reference removed from all users.")

     res.status(200).json({ message: "Project successfully deleted"})
    } else {
     return res.status(403).json({message: "Unauthorized to deleted project"})
    }
} catch (error) {
    console.log("Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project"})
}
console.log("Found id")
}