import * as mongoose from 'mongoose';
import { AppObject } from '../../../commons/app.object';

const ContestHistorySchema = new mongoose.Schema(
  {
    contest: { type: mongoose.Types.ObjectId, ref: AppObject.MONGO.COLLECTION.CONTESTS},
    user: { type: mongoose.Types.ObjectId, ref: AppObject.MONGO.COLLECTION.USERS},
    status: { type: String, enum: AppObject.CONTEST_STATUS, default: AppObject.CONTEST_STATUS.NOT_JOIN},
    history: [{type: mongoose.Types.ObjectId, ref: AppObject.MONGO.COLLECTION.SUBMISSIONS}],
    log:{ type: mongoose.Schema.Types.Mixed, required: false}
  },
  {
    timestamps: true,
  },
);

const ContestHistoryModel: mongoose.Model<any, any, any, any, any> = mongoose.model(
  AppObject.MONGO.COLLECTION.CONTEST_HISTORIES,
  ContestHistorySchema,
);

export default ContestHistoryModel
