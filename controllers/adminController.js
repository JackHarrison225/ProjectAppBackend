const { Project } = require("../models/project");
const { User } = require("../models/user");




//###### Project Administration #######//
exports.getProjects = async function (req, res) {
   
    const userId = req.params.id;
    let userProjects = await Project.find({ Creator : userId})
    console.log("Project for userid", userId, ":", userProjects)
    res.send(userProjects)
//     let AllProjects = await Project.findById(req.params.id)
//     console.log("This should contain projects by id", AllProjects)
//     res.send(AllProjects)
}

exports.createProjects = async function (req, res) {
    let SentToken = req.body.Token
    console.log("This is the sent token:", SentToken)
    
    let creator = await User.findOne({ Token: SentToken });

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

         creator.Projects.push(project)
         await creator.save()

         console.log("Project Created and added to the user");
         res.send(true)
    
    }
    else
    {
     res.status(403).send({ message: "Owner not found" });
    }
};

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
