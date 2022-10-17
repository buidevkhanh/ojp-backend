import * as mongoose from 'mongoose';
import { AppObject } from '../../commons/app.object';
import { hashInformation } from '../../libs/utils/string.util';

const UserModelSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    userPass: { type: String },
    userEmail: { type: String, unique: true },
    displayName: { type: String },
    dateOfBirdth: { type: Date, require: false },
    userRole: {
      type: String,
      enum: Object.values(AppObject.ROLES),
      default: AppObject.ROLES.STUDENT,
    },
    firstName: { type: String, require: false },
    lastName: { type: String, require: false },
    organization: { type: String, require: false },
    status: {
      type: String,
      enum: Object.values(AppObject.ACCOUNT_STATUS),
      default: AppObject.ACCOUNT_STATUS.NOT_VERIFIED,
    },
    lastLogin: { type: Date, require: false },
    lastLogout: { type: Date, require: false },
    activateCode: {
      token: { type: String, required: false },
      expires: { type: Date, require: false },
    },
  },
  { timestamps: true },
);

UserModelSchema.pre('save', function () {
  this.userPass = hashInformation(this.userPass as string);
});

const UserModel: mongoose.Model<any, any, any, any, any> = mongoose.model(
  AppObject.MONGO.COLLECTION.USERS,
  UserModelSchema,
);

export default UserModel;
