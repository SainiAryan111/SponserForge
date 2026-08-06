const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'www.aryan.saini6@gmail.com',
    pass: 'uils yhvb qino afgz'
  }
});

async function sendEmail() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('No payload provided.');
    process.exit(1);
  }

  let payload;
  try {
    payload = JSON.parse(args[0]);
  } catch (err) {
    console.error('Invalid JSON payload:', err.message);
    process.exit(1);
  }

  const { to, subject, text, html } = payload;
  if (!to || !subject) {
    console.error('Missing required email fields (to, subject)');
    process.exit(1);
  }

  try {
    const info = await transporter.sendMail({
      from: '"SponsorForge Platform" <www.aryan.saini6@gmail.com>',
      to: to,
      subject: subject,
      text: text || '',
      html: html || text || ''
    });
    console.log('EMAIL_SENT_SUCCESS:', info.messageId);
  } catch (err) {
    console.error('EMAIL_SENT_ERROR:', err.message);
    process.exit(1);
  }
}

sendEmail();
