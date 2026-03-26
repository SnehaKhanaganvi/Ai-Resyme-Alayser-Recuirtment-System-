const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  resumePath: { type: String, required: true },
  score: Number,
  semanticScore: Number,
  keywordScore: Number,
  matchedKeywords: [String],
  missingKeywords: [String],
  status: {
    type: String,
    enum: ['Pending', 'Shortlisted', 'Rejected', 'Forwarded', 'Selected'],
    default: 'Pending'
  },
  stage: {
    type: String,
    enum: ['admin', 'recruitment'],
    default: 'admin'
  },
  interview: {
    date: Date,
    time: String,
    venue: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);