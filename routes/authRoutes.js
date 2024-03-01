const express = require("express")
const router = express.Router();

const authController = require("../controllers/authController")

router.get("/username/:usernameValue", authController.checkUser);
router.get("/Token/:Token", authController.checkToken);
router.post("/auth", authController.userLogin)
router.post("/signup", authController.userSignUp)


module.exports = router