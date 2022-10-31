import express, { Router } from 'express';
import { validate } from '../../libs/middlewares/validate.mdw';
import adminController from './admin.controller';
import { adminLogin } from './admin.validate';

const _router: Router = express.Router();

_router.post('/admin/sign-in', [validate(adminLogin), adminController.signIn]);

export const name = 'admins';
export default _router;
