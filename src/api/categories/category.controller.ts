import { NextFunction, query, Request } from 'express';
import { AppObject } from '../../commons/app.object';
import categoryService from './category.service';

async function createCategory(req: Request, res, next: NextFunction) {
  try {
    await categoryService.createCategory(req.body);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    await categoryService.updateCategory(req.body);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

async function getAllActive(req, res, next) {
  try {
    const { page, pageSize, sort } = req.query;
    const result = await categoryService.getAllCategory({
      paginate: { page, pageSize, sort },
      conditions: { status: AppObject.COMMON_STATUS.ACTIVE },
    });
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function getAll(req, res, next) {
  try {
    const { page, pageSize, sort } = req.query;
    const result = await categoryService.getAllCategory({
      paginate: { page, pageSize, sort },
    });
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

export default {
  createCategory,
  updateCategory,
  getAllActive,
  deleteCategory,
  getAll,
};
