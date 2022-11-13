import express from 'express';
import submissionController from './submission.controller';
import { bypassLogin } from '../../libs/middlewares/validate.mdw';

const _router = express.Router();

_router.get('/submission', [bypassLogin, submissionController.getSubmission]);

export const name = 'submissions';
export default _router;
