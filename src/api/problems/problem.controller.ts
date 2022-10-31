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

async function deleteTestcase(req: Request, res: Response, next: NextFunction) {
  try {
    await problemService.deleteTestcase(req.body.testcaseIds);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

async function updateTestcase(req: Request, res: Response, next: NextFunction) {
  try {
    await problemService.updateTestcase(req.params.id, req.body);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

async function updateProblem(req: Request, res: Response, next: NextFunction) {
  try {
    await problemService.updateProblem(req.params.id, req.body);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

async function getDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await problemService.getDetail(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export default {
  createProblem,
  getAllProblem,
  changeProblem,
  deleteTestcase,
  updateTestcase,
  updateProblem,
  getDetail,
};
