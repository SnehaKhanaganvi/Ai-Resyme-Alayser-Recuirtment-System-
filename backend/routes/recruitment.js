const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const Application = require('../models/Application');

const guard = [protect, requireRole('recruitment')];

// Get forwarded candidates
router.get('/candidates', guard, async (req, res) => {
  try {
    const apps = await Application.find({ status: { $in: ['forwarded', 'interview_selected', 'not_selected'] } })
      .populate('candidate', 'name email phone').sort('-createdAt');
    res.json(apps);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single application
router.get('/candidates/:id', guard, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate('candidate', 'name email phone');
    if (!app) return res.status(404).json({ message: 'Not found' });
    res.json(app);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// AI Deep Analysis (simulated)
router.post('/candidates/:id/deep-analyse', guard, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate('candidate', 'name email phone');
    if (!app) return res.status(404).json({ message: 'Not found' });
    const techStack = ['React', 'Node.js', 'MongoDB', 'Python', 'Docker', 'AWS'];
    const matched = app.skills.filter(s => techStack.some(t => s.toLowerCase().includes(t.toLowerCase())));
    const gaps = techStack.filter(t => !app.skills.some(s => s.toLowerCase().includes(t.toLowerCase())));
    app.deepAnalysis = {
      skillsMatch: `Matched: ${matched.join(', ') || 'None'}`,
      gapReport: `Gaps: ${gaps.join(', ') || 'None'}`,
      rank: Math.round((app.aiScore / 100) * 10),
    };
    await app.save();
    res.json(app);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Set interview decision
router.patch('/candidates/:id/interview', guard, async (req, res) => {
  try {
    const { decision, interviewDate, interviewTime, interviewVenue } = req.body;
    if (!['interview_selected', 'not_selected'].includes(decision)) return res.status(400).json({ message: 'Invalid decision' });
    const update = { status: decision };
    if (decision === 'interview_selected') Object.assign(update, { interviewDate, interviewTime, interviewVenue });
    const app = await Application.findByIdAndUpdate(req.params.id, update, { new: true }).populate('candidate', 'name email phone');
    res.json(app);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get interview selected (for download)
router.get('/interview-selected', guard, async (req, res) => {
  try {
    const apps = await Application.find({ status: 'interview_selected' })
      .populate('candidate', 'name email phone').sort('-createdAt');
    res.json(apps);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
