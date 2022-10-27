import express, { NextFunction, Request, Response } from 'express';
import { adminRole, loginRequire } from '../../libs/middlewares/validate.mdw';
import { validate } from '../../libs/middlewares/validate.mdw';
import categoryController from './category.controller';
import { createCategory, updateCategory } from './category.validation';

const _router = express.Router();

_router.post('/category', [
  validate(createCategory),
  categoryController.createCategory,
]);

_router.patch('/category', [
  validate(updateCategory),
  categoryController.updateCategory,
]);

_router.delete('/admin/category/:id', [
  loginRequire,
  adminRole,
  categoryController.deleteCategory,
]);

_router.get('/category', [categoryController.getAllActive]);

_router.get('/admin/category', [
  loginRequire,
  adminRole,
  categoryController.getAll,
]);

export const name = 'categories';
export default _router;
