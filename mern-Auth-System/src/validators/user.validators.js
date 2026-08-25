const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required(),

  password: Joi.string()
    .min(8)
    .max(128)
    .required(),
});

const validateCreateUser = (data) => {
  return createUserSchema.validate(data, {
    abortEarly: false,
  });
};

module.exports = {
  validateCreateUser,
};