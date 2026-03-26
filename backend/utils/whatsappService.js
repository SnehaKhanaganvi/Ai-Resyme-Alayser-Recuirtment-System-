// utils/whatsappService.js
const sendWhatsApp = async (phone, message) => {
  console.log(`📱 Sending WhatsApp to ${phone}: ${message}`);
  return true;
};

module.exports = { sendWhatsApp };