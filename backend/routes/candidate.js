const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { protect, requireRole } = require('../middleware/auth');
const Application = require('../models/Application');
const Job = require('../models/Job');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF/DOC/DOCX allowed'));
  }
});

// Submit application for a specific job
router.post('/apply/:jobId', protect, requireRole('candidate'), upload.single('resume'), async (req, res) => {
  try {
    // Check if candidate already applied for this job (per‑job, not global)
    const existing = await Application.findOne({
      candidate: req.user._id,
      job: req.params.jobId
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Fetch the job
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const { college, department, year, cgpa, skills, phone } = req.body;
    const skillsArr = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;

    // Create application (without AI fields initially)
    const app = new Application({
      candidate: req.user._id,
      job: req.params.jobId,          // <-- added job reference
      college,
      department,
      year,
      cgpa: parseFloat(cgpa),
      skills: skillsArr,
      phone,
      resumePath: req.file ? `/uploads/resumes/${req.file.filename}` : null,
      resumeOriginalName: req.file?.originalname,
    });

    let aiResult;

    try {
      const formData = new FormData();
      if (req.file) {
        formData.append('file', fs.createReadStream(req.file.path));
      }
      formData.append('job_description', job.description);

      const response = await axios.post('http://127.0.0.1:8000/analyze', formData, {
        headers: formData.getHeaders()
      });

      aiResult = response.data.data;
    } catch (err) {
      console.error('AI service failed:', err.message);
      // If AI service is unavailable, reject the application (no fallback)
      return res.status(500).json({ message: 'AI service unavailable. Please try again later.' });
    }

    // Map AI result to application fields
    app.aiScore = aiResult.final_score;
    app.aiSkills = aiResult.matched_keywords;
    app.aiFitPercent = aiResult.keyword_score;

    if (aiResult.final_score >= 75) app.aiRecommendation = 'Hire';
    else if (aiResult.final_score >= 50) app.aiRecommendation = 'Review';
    else app.aiRecommendation = 'Reject';

    app.aiReport = `
ATS Score: ${aiResult.ats_score}
Keyword Score: ${aiResult.keyword_score}
Matched: ${(aiResult.matched_keywords || []).join(', ')}
Missing: ${(aiResult.missing_keywords || []).join(', ')}
    `;

    // Save resume text (using matched keywords as a placeholder for search/analytics)
    app.resumeText = aiResult?.matched_keywords?.join(' ') || '';

    await app.save();

    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my application (for current user)
router.get('/my-application', protect, requireRole('candidate'), async (req, res) => {
  try {
    const app = await Application.findOne({ candidate: req.user._id });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;