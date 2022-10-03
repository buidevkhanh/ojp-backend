import { NextFunction } from 'express';
import * as joi from 'joi';
import { AppError } from '../errors/app.error';
export default function validate(validationSchema) {
  return async function (req, res, next: NextFunction) {
    try {
      const body = req.body;
      await validationSchema.validateAsync(body);
      next();
    } catch (error: any) {
      next(new AppError(error.details[0].message, 400));
    }
  };
}
