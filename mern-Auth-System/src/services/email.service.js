const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  try {
    const mailOptions = {
      from: `"MERN Auth System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Your Verification OTP",

      text: `Your OTP code is: ${otp}. This OTP is used to verify your email.`,

      html: `
        <div>
          <h2>Email Verification</h2>
          <p>Your OTP code is:</p>
          <h1>${otp}</h1>
          <p>Please use this OTP to verify your email.</p>
        </div>
      `,
    };

    console.log("Sending OTP email...");
    console.log("From:", process.env.EMAIL_USER);
    console.log("To:", toEmail);

    const info =
      await transporter.sendMail(mailOptions);

    console.log(
      "OTP email sent successfully:",
      info.messageId
    );

    return info;

  } catch (error) {
    console.error(
      "Nodemailer dispatch error:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  sendOtpEmail,
};