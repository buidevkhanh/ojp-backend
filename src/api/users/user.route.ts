import express, { NextFunction, Request, Response } from 'express';
import userController from './user.controller';
import { adminRole, loginRequire, validate } from '../../libs/middlewares/validate.mdw';
import { activeUser, resendCode } from './user.validation';

const _router = express.Router();

_router.get('/insert-data/user', [userController.autoInsert])

_router.get('/admin/info', [loginRequire, adminRole, userController.getAdminInfo]);

_router.get('/admin/statistic', [loginRequire, adminRole, userController.adminStatistic]);

_router.post('/users/active', [
  validate(activeUser),
  userController.activeUser,
]);

_router.post('/users/resend-code', [
  validate(resendCode),
  userController.resendCode,
]);

_router.get('/user', [
  loginRequire,
  userController.getUserInfor
])

_router.patch('/user', [loginRequire, userController.userUpdateInfo]);

_router.get('/user/ranking', userController.getTopTen);

_router.get('/user/ranking/me', [loginRequire, userController.userGetRanking]);

export const name = 'users';
export default _router;
