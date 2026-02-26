const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, applicationNumber } = req.body;

  if (!email || !applicationNumber) {
    return res.status(400).json({ error: 'Missing email or application number' });
  }

  // Use the credentials provided by the user
  const transporter = nodemailer.createTransport({
    host: 'smtp.mail.yahoo.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: 'keinfoimmigration@yahoo.com',
      pass: '0140526299C',
    },
  });

  const mailOptions = {
    from: '"Germany Jobs Immigration" <keinfoimmigration@yahoo.com>',
    to: email,
    subject: 'Application Received - Germany Jobs',
    text: `Hello,\n\nYour application has been successfully received.\n\nYour Application Number is: ${applicationNumber}\n\nPlease keep this number safe as you will need it to check your status.\n\nBest regards,\nGermany Jobs Team`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #003366;">Application Received</h2>
        <p>Hello,</p>
        <p>Your application has been successfully received and is currently under review.</p>
        <div style="background: #f4f8fb; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="margin: 0; color: #666; font-size: 14px;">Application Number</p>
          <p style="margin: 5px 0 0; color: #003366; font-size: 24px; font-weight: bold;">${applicationNumber}</p>
        </div>
        <p>Please keep this number safe. You can use it to check your application status on our website.</p>
        <p>Best regards,<br><strong>Germany Jobs Team</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}
