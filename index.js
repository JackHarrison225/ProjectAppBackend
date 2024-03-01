const express = require("express");

const app = express();
const { User } = require("./models/user");
const authRouter = require("./routes/authRoutes")
const adminRouter = require("./routes/adminRoutes")
const userRouter = require("./routes/userRoutes")

require("dotenv").config();
const cors = require("cors");


const mongoose = require("mongoose");

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err.message);
  });


app.use(express.json());




//##### Authorization middleware ######//
app.use(cors());

app.use(authRouter)



app.use(async (req, res, next) => {
     console.log("AuthCall")
     const authHeader = req.headers["authorization"];
     console.log("Reading AuthHeader...")
     console.log("The authheader is:", authHeader)
     const token = authHeader.split(' ')[1]
     console.log("New split header is:", token)
     const user = await User.findOne({ Token: token });
     
     try {

      if (user) {
        console.log("Valid Token")
        
        //check expiredate 
        //if fine next
        //if not remove token 

        next();
   } 

     } catch (error) {
      console.log("There was a problem:", error)
      return res.sendStatus(403);
     }
 });
 //#####################################//

 app.use(adminRouter)
 app.use(userRouter)



//####### starting the server #########//
app.listen(
  3000, 
  () => {
  console.log("listening on port 3000");
});
//#####################################//