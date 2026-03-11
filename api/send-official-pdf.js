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

  const { pdfBase64, email, applicationNumber, phone } = req.body;

  if (!pdfBase64 || !email || !applicationNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
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
    from: `"Germany Jobs Official" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `OFFICIAL DOCUMENT: Germany Jobs Application - ${applicationNumber}`,
    text: `Find attached your official Germany Jobs application document.\n\nThis document confirms your job selection and application status.\n\nIf you have any issues, please reach us for support.\n\nBest regards,\nGermany Jobs Team`,
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
           <h2 style="color: #003366; margin: 0; font-size: 24px;">Official Employment Offer Notification</h2>
           <p style="color: #64748b; font-size: 14px;">Federal Bureau of Immigration & Global Employment</p>
        </div>

        <p>Dear Candidate,</p>
        <p>Congratulations! Your application for the <strong>Germany Jobs</strong> program has been successful. Please find your official job placement document attached to this email.</p>
        
        <div style="background: #f0fdf4; padding: 25px; border-radius: 10px; text-align: center; margin: 25px 0; border: 1px solid #dcfce7;">
          <h3 style="margin: 0 0 10px 0; color: #166534;">Offer Ref: ${applicationNumber}</h3>
          <p style="color: #15803d; margin-bottom: 20px; font-weight: 500;">Please click the button below to formally accept this employment offer.</p>
          <a href="https://kenyagermany-jobs.vercel.app/confirm?ref=${applicationNumber}" 
             style="background-color: #003366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
             ACCEPT EMPLOYMENT OFFER
          </a>
        </div>

        <div style="background: #fffbeb; padding: 20px; border-radius: 10px; border: 1px solid #fef3c7; margin-bottom: 25px;">
          <h4 style="color: #92400e; margin-top: 0; display: flex; align-items: center; gap: 8px;">
            ⚠️ IMPORTANT: NEXT STEPS
          </h4>
          <p style="font-size: 14px; color: #78350f;">
            Upon your formal acceptance, we will immediately <strong>initiate the Visa Processing protocol</strong> with the German Federal Authorities. 
            To ensure a smooth transition, please begin preparing the following standard documents immediately:
          </p>
          <ul style="font-size: 14px; color: #78350f; padding-left: 20px;">
            <li><strong>Original National ID Card</strong> (Mandatory for verification)</li>
            <li><strong>Relevant Professional Certifications</strong> & Job-specific Documents</li>
            <li><strong>Current Passport Photographs</strong> (White background)</li>
            <li><strong>International Passport</strong> (If you already possess one)</li>
            <li><strong>The Attached Official Document</strong> (Printed copy)</li>
          </ul>
        </div>
        
        <p style="font-size: 14px;"><strong>Support:</strong> If you have any questions regarding the visa process or your assignment, please respond to this email or contact our regional coordination office.</p>
        
        <p style="margin-top: 35px; border-top: 1px solid #eee; padding-top: 20px;">
          Best regards,<br>
          <strong style="color: #003366;">Administrative Director</strong><br>
          <span style="font-size: 13px; color: #64748b;">Germany Jobs Immigration Division</span>
        </p>
        
        <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px;">
          This is an official institutional document. Please do not share sensitive application details publicly.<br>
          <span style="color: #f8fafc;">Message Ref: ${Date.now()}</span>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `GermanyJobs_Official_${applicationNumber}.pdf`,
        content: pdfBase64.split('base64,')[1],
        encoding: 'base64'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    
    // Update Supabase - attempt to set a record of document sent
    const { data: currentApp } = await supabase
      .from('applications')
      .select('sent_sms_stages, phone')
      .eq('application_number', applicationNumber)
      .single();

    const { error: updateError } = await supabase
      .from('applications')
      .update({ 
          last_sms_stage: 'DocSent',
          last_sms_at: new Date().toISOString(),
          official_document_sent: 1
      })
      .eq('application_number', applicationNumber);

    if (updateError) {
        console.warn("Update failed", updateError);
    }

    const targetPhone = phone || currentApp?.phone;
    if (targetPhone && (!currentApp?.sent_sms_stages || !currentApp.sent_sms_stages.includes('DocSent'))) {
      await supabase.rpc('append_sms_stage', { 
          applicant_phone: targetPhone, 
          new_stage: 'DocSent' 
      });
    }

    return res.status(200).json({ message: 'Official document sent successfully' });
  } catch (error) {
    console.error('Error sending official document:', error);
    return res.status(500).json({ error: 'Failed to send official document', details: error.message });
  }
}
