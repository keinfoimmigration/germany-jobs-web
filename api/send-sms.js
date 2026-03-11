import pkg from 'follow-redirects';
import { createClient } from '@supabase/supabase-js';

const { https } = pkg;
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://gbotwkyaagcffzvcyzuy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_Egi9rMCDbL0BP6R9Mbh_0Q_LxEHau5r'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, message, stage, applicationNumber } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'Missing phone or message' });
  }

  // Formatting phone number for EMREIGN (prefers 254... format)
  let formattedPhone = phone.trim().replace(/\s+/g, '');
  if (formattedPhone.startsWith('+254')) {
    formattedPhone = '254' + formattedPhone.slice(4);
  } else if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith('7')) {
    formattedPhone = '254' + formattedPhone;
  }

  const options = {
    'method': 'GET',
    'hostname': 'sms.emreignltd.com',
    'path': `/api/services/sendsms?partnerID=15844&apikey=583f632103726f0eeba08d70955b6750&message=${encodeURIComponent(message)}&shortcode=EMREIGN_SMS&mobile=${formattedPhone}`,
    'headers': {
      'Cookie': 'PHPSESSID=g5auaksmeuem7d0d3l4u6ab4hd'
    },
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
      // Record in Supabase
      if (applicationNumber && stage) {
          await supabase
            .from('applications')
            .update({ 
                last_sms_stage: stage,
                last_sms_at: new Date().toISOString()
            })
            .eq('application_number', applicationNumber);

          await supabase.rpc('append_sms_stage', { 
              applicant_phone: phone, 
              new_stage: stage 
          });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'SMS sent successfully',
        details: apiResponse.data 
      });
    } else {
      throw new Error(`SMS Provider returned status ${apiResponse.status}: ${apiResponse.data}`);
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return res.status(500).json({ error: 'Failed to send SMS', details: error.message });
  }
}
