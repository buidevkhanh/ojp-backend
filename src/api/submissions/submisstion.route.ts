import express from 'express';
import submissionController from './submission.controller';
import { adminRole, bypassLogin, loginRequire } from '../../libs/middlewares/validate.mdw';

const _router = express.Router();

_router.get('/submission', [bypassLogin, submissionController.getSubmission]);

_router.get('/submission/:id', [bypassLogin, submissionController.detail]);

_router.get('/admin/submission', [loginRequire, adminRole, submissionController.adminList]);

_router.delete('/admin/:id/submission', [loginRequire, adminRole, submissionController.removeSubmission]);

export const name = 'submissions';
export default _router;
