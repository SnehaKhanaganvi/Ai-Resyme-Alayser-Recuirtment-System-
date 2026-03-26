const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendWhatsAppMessage } = require('../controllers/notificationController');
const router = express.Router();

router.post('/whatsapp', protect, sendWhatsAppMessage);

module.exports = router;