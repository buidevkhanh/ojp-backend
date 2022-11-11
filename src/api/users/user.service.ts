import { hashInformation } from '../../libs/utils/string.util';
import { IUserSignUp } from '../auths/auth.interface';
import { UserRepository } from './user.repository';
import { AppError } from '../../libs/errors/app.error';
import { AppObject } from '../../commons/app.object';
import { sendEmail } from '../../libs/utils/email.util';

async function verifyAccount(params: {
  nameOrEmail: string;
  password: string;
}): Promise<any> {
  const password = hashInformation(params.password);
  const account = params.nameOrEmail;
  return UserRepository.findOneByCondition({
    $or: [{ username: account }, { userEmail: account }],
    password,
  });
}

async function getUserInfor(nameOrEmail: string) {
  const existUser: any = await UserRepository.TSchema.findOne({ $or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
  if(!existUser) {
    throw new AppError(`UserNotExist`, 400);
  }
  if(existUser.status !== AppObject.ACCOUNT_STATUS.VERIFIED) {
    throw new AppError(`UserIs${existUser.status}`, 400);
  } 
  return   {
  username: existUser.username,
  userEmail: existUser.userEmail,
  displayName: existUser.displayName,
  dateOfBirdth: existUser.dateOfBirdth || null,
  firstName: existUser.firstName || null,
  lastName: existUser.lastName || null,
  organization: existUser.organization || null,
  avatar: existUser.avatar || AppObject.DEFAULT_AVATAR.URL,
  createdAt: existUser.createdAt,
  updatedAt: existUser.updatedAt
}
}

async function checkUserIsExist(params: {
  username?: string;
  email?: string;
  displayName?: string;
}): Promise<boolean> {
  const existUser = await UserRepository.findOneByCondition({
    $or: [
      { username: params.username },
      { userEmail: params.email },
      { displayName: params.displayName },
    ],
  });
  if (existUser) return true;
  return false;
}

async function registerUser(params: IUserSignUp): Promise<void> {
  return UserRepository.createOne(params);
}

async function findUser(params): Promise<any> {
  return UserRepository.findOneByCondition(params);
}

async function activeUser(params: { token: string; nameOrEmail: string }) {
  const existUser = await UserRepository.findOneByCondition({
    $and: [
      {
        $or: [
          { username: params.nameOrEmail },
          { userEmail: params.nameOrEmail },
        ],
      },
      {
        status: AppObject.ACCOUNT_STATUS.NOT_VERIFIED,
      },
    ],
  });
  if (!existUser) {
    throw new AppError(`InvalidUser`, 400);
  }
  if (existUser.activateCode.token === params.token) {
    if (existUser.activateCode.expires > new Date()) {
      existUser.status = AppObject.ACCOUNT_STATUS.VERIFIED;
      await existUser.save();
    } else {
      throw new AppError(`TokenExpired`, 400);
    }
  } else {
    throw new AppError(`InavlidToken`, 400);
  }
}

async function resendCode(nameOrEmail: string) {
  const existUser = await UserRepository.findOneByCondition({
    $and: [
      {
        $or: [{ username: nameOrEmail }, { userEmail: nameOrEmail }],
      },
      {
        status: AppObject.ACCOUNT_STATUS.NOT_VERIFIED,
      },
    ],
  });
  if (!existUser) {
    throw new AppError(`InvalidUser`, 400);
  }
  const activateCode = (
    Math.ceil(+new Date() * (Math.random() * 100)) + ''
  ).slice(-5);

  existUser.activateCode = {
    token: activateCode,
    expires: new Date().setMinutes(new Date().getMinutes() + 5),
  };

  await existUser.save();

  sendEmail(
    existUser.userEmail,
    'Verify your E-mail adress',
    {
      verifyCode: activateCode,
      email: existUser.userEmail,
      user: existUser.username,
    },
    'src/templates/verify-email.template.hbs',
  );
}

export default {
  verifyAccount,
  checkUserIsExist,
  registerUser,
  findUser,
  activeUser,
  resendCode,
  getUserInfor
};
