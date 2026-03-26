const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const {
  getForwardedCandidates,
  deepAnalysis,
  setInterview,
  finalDecision
} = require('../controllers/recruitmentController');
const router = express.Router();

router.use(protect);
router.use(roleCheck('recruitment'));

router.get('/candidates', getForwardedCandidates);
router.post('/analyze/:id', deepAnalysis);
router.put('/interview/:id', setInterview);
router.put('/decision/:id', finalDecision);

module.exports = router;