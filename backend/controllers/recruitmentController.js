const Application = require('../models/Application');
const User = require('../models/User');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const { analyzeResume } = require('../utils/aiService');

// @desc    Get forwarded candidates
// @route   GET /api/recruitment/candidates
exports.getForwardedCandidates = async (req, res) => {
  try {
    const applications = await Application.find({ stage: 'recruitment', status: 'Forwarded' })
      .populate('userId', 'name')
      .populate('jobId', 'title');
    const formatted = applications.map(app => ({
      name: app.userId.name,
      job: app.jobId.title,
      score: app.score,
      status: app.status
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Deep analysis (optional AI call)
// @route   POST /api/recruitment/analyze/:id
exports.deepAnalysis = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId', 'skills');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Simulate deeper analysis (could call a more advanced AI)
    // For mock, just adjust score randomly
    const deepScore = Math.min(100, application.score + Math.floor(Math.random() * 10));
    // In reality, you might call another AI endpoint

    res.json({ deepScore, rank: 1 }); // rank mock
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Set interview
// @route   PUT /api/recruitment/interview/:id
exports.setInterview = async (req, res) => {
  try {
    const { date, time, venue } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    application.interview = { date, time, venue };
    await application.save();

    // Notify candidate
    await Notification.create({
      userId: application.userId,
      message: `Interview scheduled on ${date} at ${time} via ${venue}`
    });

    res.json({ message: 'Interview scheduled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Final decision (select/reject)
// @route   PUT /api/recruitment/decision/:id
exports.finalDecision = async (req, res) => {
  try {
    const { status } = req.body; // 'Selected' or 'Rejected'
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    application.status = status;
    await application.save();

    const message = status === 'Selected' ? 'Congratulations! You have been selected 🎉' : 'We regret to inform you...';
    await Notification.create({
      userId: application.userId,
      message
    });

    res.json({ message: `Candidate ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};