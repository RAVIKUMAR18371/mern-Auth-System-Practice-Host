const Joi = require("joi");

const verifyOtpSchema = Joi.object({
  userId: Joi.string()
    .hex()
    .length(24)
    .required(),

  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
});

const validateVerifyOtp = (data) => {
  return verifyOtpSchema.validate(data, {
    abortEarly: false,
  });
};

module.exports = {
  validateVerifyOtp,
};