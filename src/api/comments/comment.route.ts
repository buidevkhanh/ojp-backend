import express from 'express';
import { adminRole, bypassLogin, loginRequire, studentRole } from '../../libs/middlewares/validate.mdw';
import commentController from './comment.controller';

const _router = express.Router();

_router.post('/comment', [loginRequire, studentRole, commentController.createComment]);

_router.patch('/comment', [loginRequire, studentRole, commentController.updateComment]);

_router.get('/comment/:id', [commentController.getComment]);

_router.delete('/comment/:id', [loginRequire, studentRole, commentController.removeComment]);

_router.post('/comment/reply', [loginRequire, studentRole, commentController.createReply]);

_router.patch('/comment/reply', [loginRequire, studentRole, commentController.updateReply]);

_router.delete('/comment/reply/:id', [loginRequire, studentRole, commentController.removeReply]);

_router.post('/comment/reaction', [loginRequire, studentRole, commentController.createReaction]);

_router.patch('/comment/reaction', [loginRequire, studentRole, commentController.updateReaction]);

_router.get('/comment/reaction/:id', [loginRequire, studentRole, commentController.getOwn]);

_router.get('/comment/reaction/problem/:id', [loginRequire, studentRole, commentController.getReaction]);

export const name = 'comments';
export default _router;
