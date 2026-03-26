const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const {
  getAllApplications,
  getApplication,
  updateStatus,
  forwardToRecruitment
} = require('../controllers/adminController');
const router = express.Router();

router.use(protect);
router.use(roleCheck('admin'));

router.get('/applications', getAllApplications);
router.get('/application/:id', getApplication);
router.put('/status/:id', updateStatus);
router.post('/forward/:id', forwardToRecruitment);

module.exports = router;