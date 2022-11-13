import { NextFunction } from 'express';
import { AppObject } from '../../commons/app.object';
import jwt from '../../commons/jwt';
import { AppError } from '../errors/app.error';

export function validate(validationSchema) {
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

export function bypassLogin(req, res, next) {
  try {
    const authToken = req.get('Authorization').split('Bearer ');
    if (authToken.length === 1) {
       req.payload = null;
    } else if (authToken.length === 2) {
      const token = authToken[1];
      try {
        const payload = jwt.verifyToken(token);
        req.payload = payload;
      } catch (error) {
        req.payload = null;
      }
    } else {
      req.payload = null;
    }
  } catch (error) {
    req.payload = null;
  }
  next();
}

export function loginRequire(req, res, next) {
  try {
    const authToken = req.get('Authorization').split('Bearer ');
    if (authToken.length === 1) {
      next(new AppError('NotBearerToken', 400));
    } else if (authToken.length === 2) {
      const token = authToken[1];
      try {
        const payload = jwt.verifyToken(token);
        req.payload = payload;
        next();
      } catch (error) {
        next(new AppError((error as any).message, 400));
      }
    } else {
      next(new AppError('TokenFormatNotFound', 400));
    }
  } catch (error) {
    next(new AppError('Unauthorized', 401));
  }
}

export function adminRole(req, res, next: NextFunction) {
  if (req?.payload?.role === AppObject.ROLES.ADMIN) {
    return next();
  }
  return next(new AppError('ForbiddenResource', 403));
}

export function studentRole(req, res, next: NextFunction) {
  if (req?.payload?.role === AppObject.ROLES.STUDENT) {
    return next();
  }
  return next(new AppError('ForbiddenResource', 403));
}

export function teacherRole(req, res, next: NextFunction) {
  if (req?.payload?.role === AppObject.ROLES.TEACHER) {
    return next();
  }
  return next(new AppError('ForbiddenResource', 403));
}

export function groupRole(req, res, next: NextFunction) {
  if (
    req?.payload?.role === AppObject.ROLES.TEACHER ||
    req?.payload?.role === AppObject.ROLES.STUDENT
  ) {
    return next();
  }
  return next(new AppError('ForbiddenResource', 403));
}
