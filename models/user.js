const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
     Username: String,
     Email: String,
     Password: String,
     PFP: String,
     Bio: String,
     Friends: Array, 
     Projects: Array, 
     Token: String,
     ExpireDate: Date
})

module.exports.User = mongoose.model('User', userSchema)