import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://gbotwkyaagcffzvcyzuy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_Egi9rMCDbL0BP6R9Mbh_0Q_LxEHau5r'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, applicationNumber, phone } = req.body;

  if (!email || !applicationNumber) {
    return res.status(400).json({ error: 'Missing email or application number' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Germany Jobs Immigration" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Action Required: Select Your Job Role - ${applicationNumber}`,
    text: `Congratulations!\n\nYour application (${applicationNumber}) for the Germany Jobs program has been officially approved.\n\nNext Step: Please visit our website, go to the "Track Status" page, and select your preferred job role from our updated list of over 500 available positions.\n\nWe look forward to seeing your selection!\n\nBest regards,\nGermany Jobs Team`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #003366; text-align: center;">Congratulations on Your Approval!</h2>
        <p>Hello,</p>
        <p>We are thrilled to inform you that your application <strong>${applicationNumber}</strong> has been <strong>Approved</strong>. You are one step closer to your career in Germany!</p>
        
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; border: 1px solid #fde68a;">
          <h3 style="margin: 0; color: #92400e;">Next Step: Job Selection</h3>
          <p style="color: #333;">Please log in to our portal to select your preferred role from over <strong>500+ exciting opportunities</strong> currently available.</p>
          <a href="https://kenyagermany-jobs.vercel.app/checkstatus" style="display: inline-block; background: #003366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Select Your Job Now</a>
        </div>
        
        <p>If you have any questions, our support team is here to help.</p>
        
        <p style="margin-top: 30px;">Best regards,<br>
        <strong style="color: #003366;">The Germany Jobs Team</strong></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message regarding your approved application status.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    
    // Update Supabase
    await supabase
      .from('applications')
      .update({ 
          last_sms_stage: 'JobChoice',
          last_sms_at: new Date().toISOString()
      })
      .eq('application_number', applicationNumber);

    if (phone) {
      await supabase.rpc('append_sms_stage', { 
          applicant_phone: phone, 
          new_stage: 'JobChoice' 
      });
    }

    return res.status(200).json({ message: 'Job notification email sent successfully' });
  } catch (error) {
    console.error('Error sending job notification email:', error);
    return res.status(500).json({ error: 'Failed to send notification email', details: error.message });
  }
}
