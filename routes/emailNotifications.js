import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: 'testagile16@outlook.com',
      pass: 'Test@9923',
    },
  });

  const mailOptions = {
    from: 'testagile16@outlook.com',
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error occurred:', error.message);
  }
};

export const sendRegistrationEmail = async (to, subject, text) => {
  await sendEmail(to, subject, text);
};

  

  