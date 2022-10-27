import express, { NextFunction, Request, Response } from 'express';
import userController from './user.controller';
import { validate } from '../../libs/middlewares/validate.mdw';
import { activeUser, resendCode } from './user.validation';

const _router = express.Router();

_router.post('/users/active', [
  validate(activeUser),
  userController.activeUser,
]);

_router.post('/users/resend-code', [
  validate(resendCode),
  userController.resendCode,
]);

export const name = 'users';
export default _router;
