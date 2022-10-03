import mongoose from 'mongoose';
import { MongooseRepository } from '../../libs/databases/mongoose.repository';
import UserModel from './user.collection';

class UserORM extends MongooseRepository<typeof UserModel> {
  constructor() {
    super(UserModel);
  }
}

export const UserRepository = new UserORM();
