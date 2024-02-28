const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
    	Title: String,
    	Tags: Array,
		Description: String,
		Owners: Array,
		Team: Array,
		Picture: String
})

module.exports.Project = mongoose.model('Project', projectSchema)