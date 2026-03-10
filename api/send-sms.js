import pkg from 'follow-redirects';
const { https } = pkg;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'Missing phone or message' });
  }

  // Formatting phone number
  let formattedPhone = phone;
  if (formattedPhone.startsWith('+254')) {
    formattedPhone = '0' + formattedPhone.slice(4);
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
        apiRes.on("data", function (chunk) {
          chunks.push(chunk);
        });
        apiRes.on("end", function () {
          const body = Buffer.concat(chunks);
          resolve({ status: apiRes.statusCode, data: body.toString() });
        });
        apiRes.on("error", function (error) {
          reject(error);
        });
      });
      apiReq.end();
    });

    console.log(`SMS API Response for ${formattedPhone}:`, apiResponse.data);

    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      return res.status(200).json({ 
        success: true, 
        message: 'SMS sent successfully',
        details: apiResponse.data 
      });
    } else {
      throw new Error(`SMS Provider returned status ${apiResponse.status}: ${apiResponse.data}`);
    }
  } catch (error) {
    console.error('Error sending SMS via Emreign:', error);
    return res.status(500).json({ error: 'Failed to send SMS', details: error.message });
  }
}
