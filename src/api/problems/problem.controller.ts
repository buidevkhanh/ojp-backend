import { NextFunction, Request, Response } from 'express';
import problemService from './problem.service';

async function createProblem(req: Request, res: Response, next: NextFunction) {
  try {
    await problemService.createProblem(req.body);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

async function getAllProblem(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, pageSize, sort, status } = req.query;
    const conditions = {};
    if (status) {
      Object.assign(conditions, { status: { $eq: status } });
    }
    const result = await problemService.listByAdmin({
      conditions,
      paginate: { page, pageSize, sort },
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function changeProblem(req: Request, res: Response, next: NextFunction) {
  try {
    await problemService.changeProblem(req.params.id);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

export default {
  createProblem,
  getAllProblem,
  changeProblem,
};
