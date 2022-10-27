import joi from 'joi';

export const adminLogin = joi.object({
  email: joi.string().email().required(),
  password: joi
    .string()
    .regex(new RegExp(`^[\-a-zA-Z0-9\/\_\!\?\.\#\$\@\&\*\(\)\|]{8,}$`))
    .messages({
      'string.pattern.base':
        'password length between 8 and 20 charactors, contains letters or number or special charactor',
    })
    .required(),
});
