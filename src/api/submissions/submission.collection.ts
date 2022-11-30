import * as mongoose from 'mongoose';
import { AppObject } from '../../commons/app.object';

const SubmissionSchema = new mongoose.Schema(
  {
    problem: { type: mongoose.Types.ObjectId, ref: AppObject.MONGO.COLLECTION.PROBLEMS},
    user: {type: mongoose.Types.ObjectId, ref: AppObject.MONGO.COLLECTION.USERS},
    userCode: { type: String },
    language: { type: String, default: 'cpp'},
    memory: { type: Number, default: 0},
    executeTime: { type: Number, default: 0},
    passPercent: { type: Number, default: 0},
    detail: { type: String, require: false, default: ''},
    status: { type: String, enum: Object.values(AppObject.SUBMISSION_STATUS), default: AppObject.SUBMISSION_STATUS.PENDING},
    contest: { type: mongoose.Types.ObjectId, require: false}
  },
  {
    timestamps: true,
  },
);

const SubmissionModel: mongoose.Model<any, any, any, any, any> = mongoose.model(
  AppObject.MONGO.COLLECTION.SUBMISSIONS,
  SubmissionSchema,
);

export default SubmissionModel;
