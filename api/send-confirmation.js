import nodemailer from 'nodemailer';

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
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Germany Jobs Immigration" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Application Received - ${applicationNumber}`,
    text: `Hello,\n\nThank you for applying for the Germany Jobs program! We have successfully received your application.\n\nYour Application Number is: ${applicationNumber}\n\nYou can track your application status on our website at any time. We are excited to assist you in this journey!\n\nBest regards,\nGermany Jobs Team`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #003366; text-align: center;">Application Received!</h2>
        <p>Hello,</p>
        <p>Thank you for choosing <strong>Germany Jobs Immigration</strong>. We are pleased to inform you that your application has been successfully received and is now under review.</p>
        
        <div style="background: #f4f8fb; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; border: 1px solid #e0e8ef;">
          <p style="margin: 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Application Number</p>
          <p style="margin: 10px 0 0; color: #003366; font-size: 28px; font-weight: bold;">${applicationNumber}</p>
        </div>
        
        <p>You can use this number to check your status on our portal. We will keep you updated on any progress.</p>
        
        <p style="margin-top: 30px;">Best regards,<br>
        <strong style="color: #003366;">The Germany Jobs Team</strong></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message, please do not reply directly to this email.</p>
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
