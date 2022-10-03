import express, { NextFunction, Request, Response, Router } from 'express';
import { loginValidation, regisValidation } from './auth.validation';
import validate from '../../libs/middlewares/validate.mdw';
import userController from './auth.contoller';

const _router: Router = express.Router();

_router.post('/auths/signin', [
  validate(loginValidation),
  userController.userSignin,
]);

_router.post('/auths/signup', [
  validate(regisValidation),
  userController.userSignup,
]);

_router.get('/auths', async function (req: Request, res: Response) {
  res.status(200).json({ isSuccess: true });
});

export const name = 'auths';
export default _router;
