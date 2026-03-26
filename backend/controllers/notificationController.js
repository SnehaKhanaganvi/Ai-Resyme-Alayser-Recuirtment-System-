const { sendWhatsApp } = require('../utils/whatsappService');

// @desc    Send WhatsApp message
// @route   POST /api/notify/whatsapp
exports.sendWhatsAppMessage = async (req, res) => {
  const { phone, message } = req.body;
  try {
    await sendWhatsApp(phone, message);
    res.json({ message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};