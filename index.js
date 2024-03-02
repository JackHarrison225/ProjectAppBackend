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

    if (!authHeader) {
      console.log("Authorization header is missing!")
      return res.sendStatus(401); 
    }

  
     const token = authHeader.split(' ')[1]
     console.log("New split header is:", token)

     
     try {
      const user = await User.findOne({ Token: token });
      if (user) {
        console.log("Valid Token")
        req.user = user;
        req.token = token
        
        //check expiredate 
        //if fine next
        //if not remove token 

        next();
   } else {
    console.log("Token not found or is invalid")
    res.sendStatus(403)
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