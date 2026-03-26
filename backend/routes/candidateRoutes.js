const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
  getJobs,
  applyJob,
  getApplications,
  getNotifications
} = require('../controllers/candidateController');
const router = express.Router();

router.use(protect);
router.use(roleCheck('candidate'));

router.get('/jobs', getJobs);
router.post('/apply', upload.single('resume'), applyJob);
router.get('/applications', getApplications);
router.get('/notifications', getNotifications);

module.exports = router;