const nodemailer = require("nodemailer");
const dns = require("dns");

// Force IPv4 lookup order to fix Windows IPv6 ENETUNREACH error
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendOtpEmail = async (toEmail, otp) => {
  try {
    // Forward all OTP emails to your primary address (ravikumarparasar31@gmail.com) for testing any email input
    const primaryEmail = process.env.EMAIL_USER || "ravikumarparasar31@gmail.com";

    const mailOptions = {
      from: `"MERN Auth System" <${primaryEmail}>`,
      to: primaryEmail,
      subject: `Verification OTP Code for ${toEmail}`,

      text: `Your OTP code is: ${otp}. Used to verify registration for ${toEmail}.`,

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Email Verification OTP</h2>
          <p style="color: #475569;">Verification request for: <strong>${toEmail}</strong></p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #16a34a;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 12px;">Enter this 6-digit OTP code into the registration form to verify your account immediately.</p>
        </div>
      `,
    };

    console.log("Sending OTP email...");
    console.log("From:", primaryEmail);
    console.log("To Original Inbox:", primaryEmail);
    console.log("For Target User Email:", toEmail);

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
    console.log(`========================================`);
    console.log(`[DEV OTP FALLBACK] EMAIL OTP for ${toEmail}: ${otp}`);
    console.log(`========================================`);
    return { fallback: true, otp };
  }
};

module.exports = {
  sendOtpEmail,
};