const { Project } = require("./models/project");
const { User } = require("./models/user");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');
const saltRounds = 10;