const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
    	Title: String,
    	Tags: Array,
	description: String,
	Owners: Array,
	Team: Array,
	Picture: String
})

module.exports.Project = mongoose.model('Project', projectSchema)