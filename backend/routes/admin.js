const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const Application = require('../models/Application');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Job = require('../models/Job');

const guard = [protect, requireRole('admin')];

// Get all applications
router.get('/applications', guard, async (req, res) => {
  try {
    const apps = await Application.find().populate('candidate', 'name email phone').sort('-createdAt');
    res.json(apps);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single application
router.get('/applications/:id', guard, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate('candidate', 'name email phone');
    if (!app) return res.status(404).json({ message: 'Not found' });
    res.json(app);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Shortlist or Reject
router.patch('/applications/:id/decision', guard, async (req, res) => {
  try {
    const { decision, adminNotes } = req.body;
    if (!['shortlisted', 'rejected'].includes(decision)) return res.status(400).json({ message: 'Invalid decision' });
    const app = await Application.findByIdAndUpdate(req.params.id, { status: decision, adminNotes }, { new: true }).populate('candidate', 'name email phone');
    res.json(app);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Forward shortlisted to recruitment
router.patch('/applications/:id/forward', guard, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app || app.status !== 'shortlisted') return res.status(400).json({ message: 'Only shortlisted applications can be forwarded' });
    app.status = 'forwarded';
    await app.save();
    res.json(app);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create recruitment team member
router.post('/recruitment-team', guard, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ name, email, password, phone, role: 'recruitment', createdBy: req.user._id });
    res.status(201).json({ id: user._id, name: user.name, email, role: user.role });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all recruitment team members
router.get('/recruitment-team', guard, async (req, res) => {
  try {
    const team = await User.find({ role: 'recruitment' }).select('-password').sort('-createdAt');
    res.json(team);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Toggle recruitment member active/inactive
router.patch('/recruitment-team/:id/toggle', guard, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ isActive: user.isActive });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get shortlisted list (for download)
router.get('/shortlisted', guard, async (req, res) => {
  try {
    const apps = await Application.find({ status: { $in: ['shortlisted', 'forwarded', 'interview_selected'] } })
      .populate('candidate', 'name email phone').sort('-createdAt');
    res.json(apps);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
// Create a job
router.post('/jobs', guard, async (req, res) => {
  try {
    const { title, description } = req.body;
    const job = await Job.create({ title, description, createdBy: req.user._id });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get ranked applications
router.get('/ranked', guard, async (req, res) => {
  try {
    const apps = await Application.find()
      .populate('candidate', 'name email')
      .sort({ aiScore: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
