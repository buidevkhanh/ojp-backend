import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AppObject } from '../../commons/app.object';
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
    const { page, pageSize, sort, status, name } = req.query;
    const conditions = {};
    if (status) {
      Object.assign(conditions, { status: { $eq: status } });
    }
    if( name) {
      Object.assign(conditions, { problemName: { $regex: name, $options: 'i'}});
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

async function addTestcase(req: Request, res: Response, next: NextFunction) {
  try {
    await problemService.addTestcase(req.params.id, req.body.testcases);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.log(error);
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
    console.log(error);
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

async function getActiveProblem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, pageSize, sort, inClass, category, level, name, code } =
      req.query;
    const conditions = {
      status: { $eq: AppObject.PROBLEM_STATUS.ACTIVE },
      problemScope: AppObject.APP_SCOPES.PUBLIC,
    };
    if (inClass) {
      Object.assign(conditions, { problemScope: AppObject.APP_SCOPES.CLASS });
    }
    if (category) {
      Object.assign(conditions, {
        problemCategory: new mongoose.Types.ObjectId(category as string),
      });
    }
    if (level) {
      Object.assign(conditions, {
        problemLevel: level,
      });
    }
    if (name) {
      Object.assign(conditions, {
        problemName: { $regex: name, $options: 'i' },
      });
    }
    if (code) {
      Object.assign(conditions, {
        problemCode: code,
      });
    }
    const result = await problemService.getActiveProblem({
      conditions,
      paginate: { page, pageSize, sort },
    }, (req as any).payload?.nameOrEmail);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

async function getProblemDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await problemService.userGetDetail(req.query.code);
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
  addTestcase,
  getDetail,
  getActiveProblem,
  getProblemDetail,
};
