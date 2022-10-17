import * as joi from 'joi';
import { AppObject } from '../../commons/app.object';

export const loginValidation = joi.object({
  nameOrEmail: joi
    .string()
    .trim()
    .required()
    .messages({ 'string.empty': 'username or email is not empty' }),
  password: joi
    .string()
    .regex(new RegExp(`^[\-a-zA-Z0-9\/\_\!\?\.\#\$\@\&\*\(\)\|]{8,}$`))
    .messages({
      'string.pattern.base':
        'password length between 8 and 20 charactors, contains letters or number or special charactor',
    })
    .required(),
});

export const regisValidation = joi.object({
  username: joi
    .string()
    .trim()
    .required()
    .min(6)
    .messages({ 'string.empty': 'username is not empty' }),

  userPass: joi
    .string()
    .regex(new RegExp(`^[\-a-zA-Z0-9\/\_\!\?\.\#\$\@\&\*\(\)\|]{8,}$`))
    .messages({
      'string.pattern.base':
        'password length between 8 and 20 charactors, contains letters or number or special charactor',
    })
    .required(),

  userEmail: joi
    .string()
    .email()
    .messages({ 'string.email': `email must be valid email` })
    .required(),

  role: joi
    .string()
    .valid(AppObject.ROLES.STUDENT, AppObject.ROLES.TEACHER)
    .required(),

  displayName: joi
    .string()
    .pattern(new RegExp(`^[a-zA-Z ]{3,}`))
    .messages({
      'string.pattern.base': 'display name must be include letters and space',
    })
    .required(),
});
