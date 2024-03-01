const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
    	Title: String,
    	Tags: String,
		Description: String,
		Owners: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}],
		Team: Array,
		Picture: String,
		Creator: { 
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
})

module.exports.Project = mongoose.model('Project', projectSchema)


