const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    from : {type: String, required: true},
    to: {type: String, required: true},
    topic: {type: String, required: true},
    date: {type: String, required: true},
})

const emailHistroy = new mongoose.Schema({
    project_id: {type: String, required: true},
    emails : {type: [emailSchema]}
})

const emailHistoryModel = mongoose.model('emailHistroy', emailHistroy);

module.exports = emailHistoryModel;