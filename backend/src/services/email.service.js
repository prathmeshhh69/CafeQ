require('dotenv').config();
const nodemailer=require('nodemailer')

const transporter=nodemailer.createTransport({
    service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

transporter.verify((error,success)=>{
    if(error){
        console.log("Error connecting to email service :", error);
    }
    else {
        console.log("Email service is ready to operate")
    }
});

const sendEmail = async (to, subject, text, html) => {
  const info = await transporter.sendMail({
    from: `"CafeQ" <${process.env.GOOGLE_USER}>`,
    to,
    subject,
    text,
    html,
  });

  console.log('Message sent: %s', info.messageId);
  return info;
};

module.exports={transporter,sendEmail};
