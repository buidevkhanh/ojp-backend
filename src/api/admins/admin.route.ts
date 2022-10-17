import express, { Router } from 'express';
import validate from '../../libs/middlewares/validate.mdw';
import adminController from './admin.controller';

const _router: Router = express.Router();

_router.post('/admin/signin', [adminController.signIn]);

export const name = 'auths';
export default _router;
