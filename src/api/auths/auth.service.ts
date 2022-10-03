import { UserStatus } from '../../commons/enum.common';
import { AppError } from '../../libs/errors/app.error';
import { sendEmail } from '../../libs/utils/email.util';
import {
  checkUserIsExist,
  registerUser,
  verifyAccount,
} from '../users/user.service';
import { IUserSignUp } from './auth.interface';

async function authSignin(params: {
  nameOrEmail: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const existUser = await verifyAccount(params);
  if (!existUser) {
    throw new AppError(`Invalid account or password`, 400);
  }
  if (existUser.status !== UserStatus.VERIFIED) {
    throw new AppError(`Account was ${existUser.status}`, 400);
  }
  return {
    accessToken: '',
    refreshToken: '',
  };
}

async function authSignup(params: IUserSignUp) {
  const isExist = await checkUserIsExist({
    username: params.username,
    email: params.userEmail,
  });
  if (isExist) {
    throw new AppError(`Account already exist`, 400);
  }
  await registerUser(params);
}

export default {
  authSignin,
  authSignup,
};
