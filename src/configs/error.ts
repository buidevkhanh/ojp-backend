import { Application, NextFunction, Request, Response } from 'express';
import { AppError } from '../libs/errors/app.error';

export default function (app: Application) {
  app.use(function (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (!(error instanceof AppError))
      error = new AppError(`An error occurred, please check again`, 400);
    res.status(error.code || 500).json(error.jsonDetail());
  });
}
