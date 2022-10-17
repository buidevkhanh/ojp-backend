import { NextFunction, Request, Response } from 'express';
import AuthService from './auth.service';

async function userSignin(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body;
    const tokens = await AuthService.authSignin(body);
    res.status(200).json(tokens);
  } catch (error) {
    next(error);
  }
}

async function userSignup(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body;
    await AuthService.authSignup(body);
    res.status(200).json({ state: 'success' });
  } catch (error) {
    next(error);
  }
}

export default {
  userSignin,
  userSignup,
};
