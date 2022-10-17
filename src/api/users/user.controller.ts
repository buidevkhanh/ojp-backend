import { NextFunction, Request, response, Response } from 'express';
import userSerivce from './user.service';

async function activeUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { nameOrEmail, token } = req.body;
    await userSerivce.activeUser({
      token,
      nameOrEmail,
    });
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

async function resendCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { nameOrEmail } = req.body;
    await userSerivce.resendCode(nameOrEmail);
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
}

export default {
  activeUser,
  resendCode,
};
