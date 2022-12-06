import * as mongoose from 'mongoose';
import { AppObject } from '../../commons/app.object';

const CommentModelSchema = new mongoose.Schema(
  {
    problem: { type: mongoose.Types.ObjectId, ref: AppObject.MONGO.COLLECTION.PROBLEMS},
    user: { type: mongoose.Types.ObjectId, ref: AppObject.MONGO.COLLECTION.USERS},
    content: { type: String, required: true},
  },
  {
    timestamps: true,
  },
);

const CommentModel: mongoose.Model<any, any, any, any, any> = mongoose.model(
  AppObject.MONGO.COLLECTION.COMMENTS,
  CommentModelSchema,
);

export default CommentModel;
