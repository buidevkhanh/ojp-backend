import { NextFunction, Request, response, Response } from 'express';
import userService from './user.service';
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

async function getUserInfor(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = (req as any).payload;
    const user = await userSerivce.getUserInfor(payload.nameOrEmail);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

async function getTopTen(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userSerivce.getTopTen();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function userUpdateInfo(req: Request, res: Response, next: NextFunction) {
  try {
    await userSerivce.userUpdateProfile(req.body, (req as any).payload.nameOrEmail);
    res.status(200).json({ok: true});
  } catch (error) {
    next(error);
  }
}

async function userGetRanking(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.userGetRanking((req as any).payload.nameOrEmail);
    res.status(200).json({data: result});
  } catch (error) {
    next(error);
  }
}

export default {
  activeUser,
  resendCode,
  getUserInfor,
  getTopTen,
  userUpdateInfo,
  userGetRanking
};
