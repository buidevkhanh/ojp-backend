import { NextFunction, Request, Response } from 'express';
import adminService from './admin.service';

async function signIn(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const token = await adminService.signIn(email, password);
    res.status(200).json(token);
  } catch (error) {
    next(error);
  }
}

export default {
  signIn,
};
