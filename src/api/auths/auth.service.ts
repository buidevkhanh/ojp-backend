import { AppObject } from '../../commons/app.object';
import { AppError } from '../../libs/errors/app.error';
import { sendEmail } from '../../libs/utils/email.util';
import userService from '../users/user.service';
import { IUserSignUp } from './auth.interface';
import jwt from '../../commons/jwt';
import { envConfigs } from '../../configs/environment';
import { exist } from 'joi';

async function authSignin(params: {
  nameOrEmail: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const existUser = await userService.verifyAccount(params);
  if (!existUser) {
    throw new AppError(`Invalid account or password`, 400);
  }
  if (existUser.status !== AppObject.ACCOUNT_STATUS.VERIFIED) {
    throw new AppError(`Account was ${existUser.status}`, 400);
  }
  const accessToken = jwt.signToken(
    { nameOrEmail: existUser.username, role: existUser.userRole },
    envConfigs.ACCESS_TOKEN_EXPIRED,
  );
  const refreshToken = await jwt.signToken(
    { nameOrEmail: existUser.username },
    envConfigs.REFRESH_TOKEN_EXPIRED,
  );
  return {
    accessToken,
    refreshToken,
  };
}

async function authSignup(params: IUserSignUp) {
  const isExist = await userService.checkUserIsExist({
    username: params.username,
    email: params.userEmail,
  });
  if (isExist) {
    throw new AppError(`Account already exist`, 400);
  }
  const activateCode = (
    Math.ceil(+new Date() * (Math.random() * 100)) + ''
  ).slice(-5);
  Object.assign(params, {
    activateCode: {
      token: activateCode,
      expires: new Date().setMinutes(new Date().getMinutes() + 10),
    },
  });
  await userService.registerUser(params);
  sendEmail(
    params.userEmail,
    'Verify your E-mail adress',
    {
      verifyCode: activateCode,
      email: params.userEmail,
      user: params.username,
    },
    'src/templates/verify-email.template.hbs',
  );
}

export async function verifyUser(nameOrEmail: string, otpCode: string) {}

export default {
  authSignin,
  authSignup,
};
