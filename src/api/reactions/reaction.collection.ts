import * as mongoose from 'mongoose';
import { AppObject } from '../../commons/app.object';

const ReplyModelSchema = new mongoose.Schema(
  {
    target: { type: mongoose.Types.ObjectId},
    reactionType: { type: String, enum: ["agreement", "disagreement"]},
    user: { type: mongoose.Types.ObjectId, ref: AppObject.MONGO.COLLECTION.USERS},
  },
  {
    timestamps: true,
  },
);

const ReplyModel: mongoose.Model<any, any, any, any, any> = mongoose.model(
  AppObject.MONGO.COLLECTION.REACTIONS,
  ReplyModelSchema,
);

export default ReplyModel;
