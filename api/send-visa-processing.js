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
    subject: `Update: Visa Processing Commenced - ${applicationNumber}`,
    text: `Great News!\n\nYour application (${applicationNumber}) for the Germany Jobs program has reached the next stage.\n\nVisa processing has officially commenced. We will keep you updated on any further requirements or developments.\n\nBest regards,\nGermany Jobs Team`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #003366; text-align: center;">Visa Processing Commenced</h2>
        <p>Hello,</p>
        <p>We are pleased to inform you that your application <strong>${applicationNumber}</strong> has advanced to the next crucial phase.</p>
        
        <div style="background: #f0fdf4; padding: 25px; border-radius: 10px; text-align: center; margin: 25px 0; border: 1px solid #dcfce7;">
          <h3 style="margin: 0 0 10px 0; color: #166534;">Status: Visa Processing In Progress</h3>
          <p style="color: #15803d; margin-bottom: 0; font-weight: 500;">
            The Visa processing protocol with the German Federal Authorities has officially been initiated.
          </p>
        </div>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bae6fd; margin-top: 20px;">
           <h4 style="color: #0369a1; margin-top: 0; margin-bottom: 10px;">What Happens Next?</h4>
           <p style="font-size: 14px; color: #0369a1; margin: 0;">Our team is actively managing your file with the relevant embassies. We will follow up with you if any supplementary documents or biometric appointments are required.</p>
           <p style="font-size: 14px; color: #0369a1; margin-top: 10px; margin-bottom: 0;">You can expect to book your final interview soon. Please keep monitoring your status portal.</p>
        </div>
        
        <p style="margin-top: 25px;">If you have any questions, our support team is available to assist you.</p>
        
        <p style="margin-top: 35px; border-top: 1px solid #eee; padding-top: 20px;">
          Best regards,<br>
          <strong style="color: #003366;">Administrative Director</strong><br>
          <span style="font-size: 13px; color: #64748b;">Germany Jobs Immigration Division</span>
        </p>
        
        <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px;">
          This is an automated system update regarding your application status.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    
    // Update Supabase
    await supabase
      .from('applications')
      .update({ 
          last_sms_stage: 'VisaProcessing',
          last_sms_at: new Date().toISOString()
      })
      .eq('application_number', applicationNumber);

    if (phone) {
      await supabase.rpc('append_sms_stage', { 
          applicant_phone: phone, 
          new_stage: 'VisaProcessing' 
      });
    }

    return res.status(200).json({ message: 'Visa processing notification email sent successfully' });
  } catch (error) {
    console.error('Error sending visa processing notification email:', error);
    return res.status(500).json({ error: 'Failed to send notification email', details: error.message });
  }
}
