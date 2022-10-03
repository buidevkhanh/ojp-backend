import mongoose from 'mongoose';
import { hashInformation } from '../../libs/utils/string.util';
import { IUserSignUp } from '../auths/auth.interface';
import UserModel from './user.collection';
import { UserRepository } from './user.repository';

export async function verifyAccount(params: {
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

export async function checkUserIsExist(params: {
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

export async function registerUser(params: IUserSignUp): Promise<void> {
  return UserRepository.createOne(params);
}
