const express = require("express")
const router = express.Router();

const userController = require("../controllers/userController")

router.get("/user/:id", userController.findUser);
router.patch("/forgotPassword", userController.generateNewPassword);
router.patch("/changeUsername", userController.changeUsername);
router.patch("/changePassword", userController.changePassword);
router.patch("/addFriend", userController.addFriend);


module.exports = router