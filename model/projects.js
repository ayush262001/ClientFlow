const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: String, required: true },
    status: { type: Boolean, required: true },
    payment_done: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
  });

  const documentSchema = new mongoose.Schema({
    url: {type: String, required: true},
    name: {type: String, required: true}
  })

const projectSchema = new mongoose.Schema({
    name: {type: String, required: true},
    domain: {type: String, required: false},
    client_email: {type: String, required:true},
    description: {type: String, required:true},
    proposal: {type: String, required: true},
    document_shared: {type: [
        documentSchema
    ], required: false},
    bidding_amount : {type: String, required: true},
    milestones : {type: [milestoneSchema] , required: false},

})

const CountrySchema = new mongoose.Schema({
    country: {type: String, required: true},
    project : {type: [projectSchema], required: true},
    freelancer_id: {type: String, required: true},
})

const Country = mongoose.model('country', CountrySchema);

module.exports = Country;