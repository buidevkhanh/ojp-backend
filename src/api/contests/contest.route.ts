import express from 'express';
import { adminRole, bypassLogin, loginRequire } from '../../libs/middlewares/validate.mdw';
import { validate } from '../../libs/middlewares/validate.mdw';
import contestController from './contest.controller';

const _router = express.Router();

_router.post('/admin/contest', [loginRequire, adminRole, contestController.createContest]);

_router.get('/admin/contest', [loginRequire, adminRole, contestController.adminList]);

export const name = 'problems';
export default _router;
