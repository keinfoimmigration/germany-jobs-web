import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import pkg from 'follow-redirects';

// Import the supabase instance if you prefer, 
// but since this is a server-side context, let's just make sure we have access to it.
// We'll use the client from your src/utils/supabaseClient.js or re-initialize here for server-side safety.
import { supabase } from './src/utils/supabaseClient.js';

const { https } = pkg;
dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', version: '1.0.1', message: 'PDF route is active' });
});

// Routes
app.post('/api/send-confirmation', async (req, res) => {
  const { email, applicationNumber } = req.body;

  if (!email || !applicationNumber) {
    return res.status(400).json({ error: 'Missing email or application number' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
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
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

app.get('/api/get-applicants', async (req, res) => {
  try {
    console.log('Fetching applicants from Supabase...');
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length || 0} applicants.`);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ 
      error: 'Failed to fetch applicants', 
      details: error.message,
      hint: 'Check if the applications table exists and if RLS policies allow SELECT for the anon key.'
    });
  }
});

app.post('/api/send-sms', async (req, res) => {
  const { phone, message, stage, applicationNumber } = req.body;
  if (!phone || !message || !stage) {
    console.warn(`[SMS] 400 - Missing fields: phone=${!!phone}, message=${!!message}, stage=${!!stage}`);
    return res.status(400).json({ error: 'Missing phone, message or stage' });
  }

  // 1. Check if this stage was already sent (Backend safety)
  try {
    const { data: appData, error: fetchError } = await supabase
      .from('applications')
      .select('sent_sms_stages')
      .eq('phone', phone)
      .single();

    if (!fetchError && appData?.sent_sms_stages?.includes(stage) && stage !== 'DocSent') {
      console.log(`[SMS] 400 - Duplicate prevented for stage: ${stage}`);
      return res.status(400).json({ error: `SMS for stage "${stage}" has already been sent to this applicant.` });
    }
  } catch (e) {
    console.warn('Duplicate check warning:', e.message);
  }

  // 2. Format phone for EMREIGN (Usually prefers 2547... or 07...)
  let formattedPhone = phone.trim().replace(/\s+/g, '');
  if (formattedPhone.startsWith('+254')) {
    formattedPhone = '254' + formattedPhone.slice(4);
  } else if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith('7')) {
    formattedPhone = '254' + formattedPhone;
  }
  
  console.log(`[SMS] Sending to: ${formattedPhone} (Original: ${phone})`);

  const options = {
    'method': 'GET',
    'hostname': 'sms.emreignltd.com',
    'path': `/api/services/sendsms?partnerID=15844&apikey=583f632103726f0eeba08d70955b6750&message=${encodeURIComponent(message)}&shortcode=EMREIGN_SMS&mobile=${formattedPhone}`,
    'headers': { 'Cookie': 'PHPSESSID=g5auaksmeuem7d0d3l4u6ab4hd' },
    'maxRedirects': 20
  };

  try {
    const apiResponse = await new Promise((resolve, reject) => {
      const apiReq = https.request(options, function (apiRes) {
        let chunks = [];
        apiRes.on("data", chunk => chunks.push(chunk));
        apiRes.on("end", () => resolve({ status: apiRes.statusCode, data: Buffer.concat(chunks).toString() }));
        apiRes.on("error", error => reject(error));
      });
      apiReq.end();
    });

    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      console.log(`[SMS] Provider Response Body: ${apiResponse.data}`);
      
      // 2. Update the database array to record this stage
      const { error: dbError } = await supabase.rpc('append_sms_stage', { 
        applicant_phone: phone, 
        new_stage: stage 
      });

      // Fallback if RPC fails (user might not have created it)
      if (dbError) {
        console.warn('RPC failed, trying raw update. Note: This might overwrite if not careful with concurrency.');
        const { data: current } = await supabase.from('applications').select('sent_sms_stages').eq('phone', phone).single();
        const stages = current?.sent_sms_stages || [];
        if (!stages.includes(stage)) {
           await supabase
            .from('applications')
            .update({ 
               sent_sms_stages: [...stages, stage],
               last_sms_stage: stage,
               last_sms_at: new Date().toISOString()
            })
            .eq('phone', phone);
        }
      }

      res.status(200).json({ success: true, details: apiResponse.data });
    } else {
      res.status(500).json({ error: 'SMS Provider Error', details: apiResponse.data });
    }
  } catch (error) {
    console.error('SMS Error:', error);
    res.status(500).json({ error: 'Failed to send SMS', details: error.message });
  }
});

app.post('/api/send-job-notify', async (req, res) => {
  const { email, applicationNumber, phone } = req.body;
  console.log(`[Email] Attempting to send job notification to: ${email} for app: ${applicationNumber}`);

  if (!email || !applicationNumber) {
    console.warn('[Email] Missing required fields');
    return res.status(400).json({ error: 'Missing email or application number' });
  }

  // Check for credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('[Email] SMTP credentials NOT FOUND in .env');
    return res.status(500).json({ error: 'Email configuration missing on server.' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // Using 465 as per your working send-confirmation config
    secure: true,
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

        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border: 1px solid #bae6fd; margin-top: 20px;">
           <p style="font-size: 14px; color: #0369a1; margin: 0;"><strong>Pro-Tip:</strong> Once you select a job, you will receive your Official Placement Document. You will then need to confirm acceptance to begin your <strong>Visa Processing</strong>.</p>
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
    console.log('[Email] Sending via Nodemailer...');
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] SUCCESS - Message sent. ID:', info.messageId);
    
    // Update Supabase to record the JobChoice notification
    if (applicationNumber) {
        try {
            const { data: currentApp } = await supabase
                .from('applications')
                .select('sent_sms_stages')
                .eq('application_number', applicationNumber)
                .single();

            await supabase
                .from('applications')
                .update({ 
                    last_sms_stage: 'JobChoice',
                    last_sms_at: new Date().toISOString()
                })
                .eq('application_number', applicationNumber);
            
            // Only append stage if not already present
            if (phone && (!currentApp?.sent_sms_stages || !currentApp.sent_sms_stages.includes('JobChoice'))) {
                await supabase.rpc('append_sms_stage', { 
                    applicant_phone: phone, 
                    new_stage: 'JobChoice' 
                });
            }
            console.log('[Email] DB Updated for', applicationNumber);
        } catch (dbErr) {
            console.warn('[Email] DB Update failed:', dbErr.message);
        }
    }

    res.status(200).json({ message: 'Job notification email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error('[Email] Nodemailer Error:', error.message);
    res.status(500).json({ error: 'Failed to send notification email', details: error.message });
  }
});

app.post('/api/send-official-pdf', async (req, res) => {
  console.log('[Official PDF] POST /api/send-official-pdf');
  const { pdfBase64, email, applicationNumber, phone } = req.body;
  
  if (!pdfBase64) { console.warn('[Official PDF] pdfBase64 is missing'); }
  if (!email) { console.warn('[Official PDF] email is missing'); }
  if (!applicationNumber) { console.warn('[Official PDF] applicationNumber is missing'); }

  console.log(`[Official PDF] Attempting to send document to: ${email} for app: ${applicationNumber}`);

  if (!pdfBase64 || !email || !applicationNumber) {
    console.warn('[Official PDF] Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
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
          <a href="http://localhost:5173/confirm?ref=${applicationNumber}" 
             style="background-color: #003366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
             ACCEPT EMPLOYMENT OFFER (LOCAL TEST)
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
    console.log('[Official PDF] Sending email...');
    await transporter.sendMail(mailOptions);
    console.log('[Official PDF] SUCCESS - Email sent');
    
    // Update Supabase
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
        console.warn('[Official PDF] DB Update failed:', updateError.message);
    }

    const targetPhone = phone || currentApp?.phone;
    if (targetPhone && (!currentApp?.sent_sms_stages || !currentApp.sent_sms_stages.includes('DocSent'))) {
      await supabase.rpc('append_sms_stage', { 
          applicant_phone: targetPhone, 
          new_stage: 'DocSent' 
      });
    }

    res.status(200).json({ message: 'Official document sent successfully' });
  } catch (error) {
    console.error('[Official PDF] Error:', error.message);
    res.status(500).json({ error: 'Failed to send official document', details: error.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Node server running on http://127.0.0.1:${port}`);
});
