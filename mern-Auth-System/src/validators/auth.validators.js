const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(8)
    .required(),
});

const validateLogin = (data) => {
  return loginSchema.validate(data, {
    abortEarly: false,
  });
};

module.exports = {
  validateLogin,
};