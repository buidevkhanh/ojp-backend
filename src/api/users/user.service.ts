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
  updatedAt: existUser.updatedAt,
  score: existUser.score,
  practiceTime: existUser.practiceTime || 0,
  passProblem: existUser.passProblem || 0
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

async function getTopTen() {
    const list = await UserRepository.TSchema.find({status: AppObject.ACCOUNT_STATUS.VERIFIED}).sort({"score": -1}).limit(10);
    const newList = list.map((item: any) => {
      return {
        name: item.displayName,
        score: item.score,
        practiceTime: item.practiceTime,
        passProblem: item.passProblem
      }
    })
    return newList;
}

async function userUpdateProfile(profile, nameOrEmail) {
  const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
  if(!userFound) {
    throw new AppError('User not found', 400);
  }
  for(let key of Object.keys(profile)) {
    if(key === 'userEmail') {
      const userExist = await UserRepository.findOneByCondition({_id: {$ne: userFound._id}, userEmail: profile.userEmail});
      if(userExist) {
        throw new AppError('Email already exist', 400);
      }
    }
    if(key === 'displayName') {
      const userExist = await UserRepository.findOneByCondition({_id: {$ne: userFound._id}, displayName: profile.displayName});
      if(userExist) {
        throw new AppError('Name already exist', 400);
      }
    }
    if(profile[key])
      userFound[key] = profile[key];
  }
  await userFound.save();

}

async function userGetRanking(nameOrEmail) {
  const allUser = await UserRepository.TSchema.find({status: AppObject.ACCOUNT_STATUS.VERIFIED}).sort({score: -1});
  const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
  if(!userFound) {
    throw new AppError('User not found', 400);
  }
  const index = allUser.findIndex((item) => {
    return item._id.toString() === userFound._id.toString();
  })
  
  return index+1;
}

export default {
  verifyAccount,
  checkUserIsExist,
  registerUser,
  findUser,
  activeUser,
  resendCode,
  getUserInfor,
  getTopTen,
  userUpdateProfile,
  userGetRanking
};
