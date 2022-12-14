import express from 'express';
import { adminRole, bypassLogin, loginRequire, studentRole } from '../../libs/middlewares/validate.mdw';
import contestController from './contest.controller';

const _router = express.Router();

_router.post('/admin/contest', [loginRequire, adminRole, contestController.createContest]);

_router.get('/admin/contest', [loginRequire, adminRole, contestController.adminList]);

_router.get('/contest', [contestController.userList]);

_router.get('/contest/own', [loginRequire, studentRole, contestController.userListOwn]);

_router.post('/contest/register/:id', [loginRequire, studentRole, contestController.userRegister]);

_router.get('/contest/:id', [loginRequire, studentRole, contestController.userGetDetail]);

_router.get('/contest/:id/history', [loginRequire, studentRole, contestController.userGetContestHistory]);

_router.get('/contest/:id/score', [loginRequire, studentRole, contestController.getScore]);

export const name = 'contests';
export default _router;
