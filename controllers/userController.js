const { Project } = require("../models/project");
const { User } = require("../models/user");




//######## User Administration ########//
exports.findUser = async function (req, res){
    const user = await Project.findById(req.params.id);

    if(user)
    {
         res.send(user)
    }
    else
    {
         res.send(404)
    }
}

exports.generateNewPassword = async function (req, res) {
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
};

exports.changeUsername = async function (req, res) {
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

}

exports.changePassword = async function (req, res) {
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
}

exports.addFriend = async function(req, res) {
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
}
//#####################################//