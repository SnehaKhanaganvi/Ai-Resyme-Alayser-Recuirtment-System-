const nodemailer = require('nodemailer');

// Configure transporter (use your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send interview invitation email
 * @param {Object} candidate - { name, email }
 * @param {Object} interview - { date, time, venue }
 * @param {string} jobTitle
 */
exports.sendInterviewEmail = async (candidate, interview, jobTitle) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: candidate.email,
    subject: `Interview Invitation for ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Interview Invitation</h2>
        <p>Dear ${candidate.name},</p>
        <p>Congratulations! You have been shortlisted for the position of <strong>${jobTitle}</strong>.</p>
        <p>Your interview is scheduled as follows:</p>
        <ul>
          <li><strong>Date:</strong> ${interview.date}</li>
          <li><strong>Time:</strong> ${interview.time}</li>
          <li><strong>Venue:</strong> ${interview.venue}</li>
        </ul>
        <p>Please be on time and bring your resume and any supporting documents.</p>
        <p>Best regards,<br/>Recruitment Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};