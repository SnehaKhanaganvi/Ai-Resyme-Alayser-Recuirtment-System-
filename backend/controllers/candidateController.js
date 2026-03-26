const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// @desc    Get all jobs
// @route   GET /api/candidate/jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Apply for a job (with resume upload)
// @route   POST /api/candidate/apply
exports.applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const resumeFile = req.file;
    if (!resumeFile) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    // Check if already applied
    const existing = await Application.findOne({ userId: req.user.id, jobId });
    if (existing) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }


    // Call AI analysis
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));
    formData.append("job_description", job.description);

    const aiResponse = await axios.post(
      "http://localhost:8000/analyze",
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    const analysis = aiResponse.data.data;
    // Create application
    const application = await Application.create({
      userId: req.user.id,
      jobId,
      resumePath: resumeFile.path,
      score: analysis.final_score,
      semanticScore: analysis.semantic_score,
      keywordScore: analysis.keyword_score,
      matchedKeywords: analysis.matched_keywords,
      missingKeywords: analysis.missing_keywords,
      status: 'Pending',
      stage: 'admin'
    });

    res.status(201).json({
      applicationId: application._id,
      score: analysis.final_score,
      status: 'Pending'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    View my applications
// @route   GET /api/candidate/applications
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate('jobId', 'title')
      .select('jobId score status');
    const formatted = applications.map(app => ({
      jobTitle: app.jobId.title,
      score: app.score,
      status: app.status
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get notifications
// @route   GET /api/candidate/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};