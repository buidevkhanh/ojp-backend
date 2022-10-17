import * as joi from 'joi';

export const resendCode = joi.object({
  nameOrEmail: joi.string().required(),
});

export const activeUser = joi.object({
  nameOrEmail: joi.string().required(),
  token: joi.string().required().min(5).max(6),
});
