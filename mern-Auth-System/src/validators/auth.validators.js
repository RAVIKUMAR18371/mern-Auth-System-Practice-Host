const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().optional().allow(""),
  phone: Joi.string().optional().allow(""),
  identifier: Joi.string().optional().allow(""),
  password: Joi.string().required(),
}).or("email", "phone", "identifier");

const validateLogin = (data) => {
  return loginSchema.validate(data, {
    abortEarly: false,
  });
};

module.exports = {
  validateLogin,
};