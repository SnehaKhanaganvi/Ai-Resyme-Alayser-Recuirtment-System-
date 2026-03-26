const Application = require('../models/Application');
const User = require('../models/User');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const { sendWhatsApp } = require('../utils/whatsappService');

// @desc    Get all applications (admin view)
// @route   GET /api/admin/applications
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
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

// @desc    Get single application details
// @route   GET /api/admin/application/:id
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('userId', 'name')
      .populate('jobId', 'title');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({
      name: application.userId.name,
      resume: application.resumePath,
      semanticScore: application.semanticScore,
      keywordScore: application.keywordScore,
      matchedKeywords: application.matchedKeywords,
      missingKeywords: application.missingKeywords
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update status (shortlist/reject)
// @route   PUT /api/admin/status/:id
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id).populate('userId', 'name email phone');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    application.status = status;
    await application.save();

    // Create notification for candidate
    const message = status === 'Shortlisted' ? `You are shortlisted 🎉` : `Your application was rejected.`;
    await Notification.create({
      userId: application.userId._id,
      message
    });

    // Optional: Send WhatsApp if phone exists
    if (application.userId.phone) {
      await sendWhatsApp(application.userId.phone, message);
    }

    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forward to recruitment
// @route   POST /api/admin/forward/:id
exports.forwardToRecruitment = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    application.status = 'Forwarded';
    application.stage = 'recruitment';
    await application.save();

    // Notify candidate
    await Notification.create({
      userId: application.userId,
      message: 'Your application has been forwarded to recruitment.'
    });

    res.json({ message: 'Candidate forwarded to recruitment' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};