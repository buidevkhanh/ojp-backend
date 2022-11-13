import express, { NextFunction, Request, Response } from 'express';
import { adminRole, bypassLogin, loginRequire } from '../../libs/middlewares/validate.mdw';
import { validate } from '../../libs/middlewares/validate.mdw';
import problemController from './problem.controller';
import { createProblem } from './problem.validation';

const _router = express.Router();

_router.post('/admin/problem', [
  loginRequire,
  adminRole,
  validate(createProblem),
  problemController.createProblem,
]);

_router.get('/admin/problem', [
  loginRequire,
  adminRole,
  problemController.getAllProblem,
]);

_router.patch('/admin/problem/:id/status', [
  loginRequire,
  adminRole,
  problemController.changeProblem,
]);

_router.delete('/admin/problem/testcase', [
  loginRequire,
  adminRole,
  problemController.deleteTestcase,
]);

_router.patch('/admin/problem/testcase/:id', [
  loginRequire,
  adminRole,
  problemController.updateTestcase,
]);

_router.patch('/admin/problem/:id', [
  loginRequire,
  adminRole,
  problemController.updateProblem,
]);

_router.get('/admin/problem/:id', [
  loginRequire,
  adminRole,
  problemController.getDetail,
]);

_router.post('/admin/problem/testcase/:id', [
  loginRequire,
  adminRole,
  problemController.addTestcase,
]);

_router.get('/problem', [bypassLogin, problemController.getActiveProblem]);

_router.get('/problem/detail', [problemController.getProblemDetail]);

export const name = 'problems';
export default _router;
