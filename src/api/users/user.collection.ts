import * as mongoose from 'mongoose';
import { UserRole, UserStatus } from '../../commons/enum.common';
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
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    firstName: { type: String, require: false },
    lastName: { type: String, require: false },
    organization: { type: String, require: false },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.NOT_VERFIVIED,
    },
    lastLogin: { type: Date, require: false },
    lastLogout: { type: Date, require: false },
  },
  { timestamps: true },
);

UserModelSchema.pre('save', function () {
  this.userPass = hashInformation(this.userPass as string);
});

const UserModel: mongoose.Model<any, any, any, any, any> = mongoose.model(
  'User',
  UserModelSchema,
);

export default UserModel;
