const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }, // <-- added
  // Profile Info
  college: String,
  department: String,
  year: String,
  cgpa: Number,
  skills: [String],
  phone: String,
  // Resume
  resumePath: String,
  resumeOriginalName: String,
  resumeText: String, // <-- will store keywords for search/ranking
  // AI Analysis
  aiScore: { type: Number, default: null },
  aiSkills: [String],
  aiFitPercent: { type: Number, default: null },
  aiRecommendation: { type: String, enum: ['Hire', 'Review', 'Reject'], default: null },
  aiReport: { type: String, default: null },
  // Deep Analysis (Recruitment team)
  deepAnalysis: {
    skillsMatch: String,
    gapReport: String,
    rank: Number,
  },
  // Admin actions
  adminNotes: { type: String, default: '' },
  // Status flow: pending → shortlisted/rejected → forwarded → interview_selected/not_selected
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'rejected', 'forwarded', 'interview_selected', 'not_selected'],
    default: 'pending'
  },
  interviewDate: String,
  interviewTime: String,
  interviewVenue: String,
  // Notifications
  whatsappSent: { type: Boolean, default: false },
}, { timestamps: true });

// Index for fast ranking/sorting by AI score
applicationSchema.index({ aiScore: -1 });

module.exports = mongoose.model('Application', applicationSchema);