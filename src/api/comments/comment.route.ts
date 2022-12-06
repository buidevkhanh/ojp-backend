import express from 'express';
import { adminRole, bypassLogin, loginRequire, studentRole } from '../../libs/middlewares/validate.mdw';
import commentController from './comment.controller';

const _router = express.Router();

_router.post('/comment', [loginRequire, studentRole, commentController.createComment]);

_router.patch('/comment', [loginRequire, studentRole, commentController.updateComment]);

_router.get('/comment/:id', [commentController.getComment]);

_router.delete('/comment/:id', [loginRequire, studentRole, commentController.removeComment]);

export const name = 'comment';
export default _router;
