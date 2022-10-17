import express, { Router } from 'express';
import { loginValidation, regisValidation } from './auth.validation';
import validate from '../../libs/middlewares/validate.mdw';
import authController from './auth.controller';

const _router: Router = express.Router();

_router.post('/auths/signin', [
  validate(loginValidation),
  authController.userSignin,
]);

_router.post('/auths/signup', [
  validate(regisValidation),
  authController.userSignup,
]);

export const name = 'auths';
export default _router;
