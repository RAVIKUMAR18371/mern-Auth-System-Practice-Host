const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOtpSms = async (phone, otp) => {
  try {
    console.log("Sending OTP SMS...");
    console.log("To:", phone);

    const message = await client.messages.create({
      body: `Your MERN Auth verification OTP is ${otp}. This OTP is valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    console.log(
      "OTP SMS sent successfully:",
      message.sid
    );

    return message;

  } catch (error) {
    console.error(
      "Twilio SMS error:",
      error.message
    );

    throw new Error(
      "Unable to send OTP SMS"
    );
  }
};

module.exports = {
  sendOtpSms,
};