const express = require("express")
const router = express.Router();

const adminController = require("../controllers/adminController")

router.get("/createdProjects/:id", adminController.getCreatedProjects);
router.get("/savedProjects/:id", adminController.getSavedProjects);
router.get("/favouriteProjects/:id", adminController.getFavouriteProjects);
router.get("/ongoingProjects/:id", adminController.getOngoingProjects);

router.post("/CreateProject/:id", adminController.createProjects);
router.post("/addToFavouriteProjects/:id", adminController.addToFavouriteProject)
router.post("/addToSavedProjects/:id", adminController.addToSavedProject)
router.post("/addToOngoingProjects/:id", adminController.addToOnGoingProject)
router.patch("/addOwner", adminController.addProjectOwner)
router.patch("/addTeam", adminController.addToTeam)
router.patch("/updateproject", adminController.updateProject)
router.delete("/delete/:id", adminController.deleteProject)


module.exports = router