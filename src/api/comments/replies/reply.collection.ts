import * as mongoose from 'mongoose';
import { AppObject } from '../../../commons/app.object';

const ReplyModelSchema = new mongoose.Schema(
  {
    comment: { type: mongoose.Types.ObjectId, ref: AppObject.MONGO.COLLECTION.COMMENTS},
    user: { type: mongoose.Types.ObjectId, ref: AppObject.MONGO.COLLECTION.USERS},
    content: { type: String, required: true},
  },
  {
    timestamps: true,
  },
);

const ReplyModel: mongoose.Model<any, any, any, any, any> = mongoose.model(
  AppObject.MONGO.COLLECTION.REPLIES,
  ReplyModelSchema,
);

export default ReplyModel;
