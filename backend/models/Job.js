const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skills: [String]
});

module.exports = mongoose.model('Job', JobSchema);