import express, { NextFunction, Request, Response } from 'express';
import { adminRole, loginRequire } from '../../libs/middlewares/validate.mdw';
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

_router.patch('/admin/problem/testcase/:id', []);

_router.patch('/admin/problem/:id/status', [
  loginRequire,
  adminRole,
  problemController.changeProblem,
]);

export const name = 'problems';
export default _router;