const express = require("express")
const router = express.Router();

const adminController = require("../controllers/adminController")

router.get("/projects/:id", adminController.getProjects);
router.post("/CreateProject/:id", adminController.createProjects);
router.patch("/addOwner", adminController.addProjectOwner)
router.patch("/addTeam", adminController.addToTeam)
router.patch("/updateproject", adminController.updateProject)
router.delete("/delete/:id", adminController.deleteProject)


module.exports = router