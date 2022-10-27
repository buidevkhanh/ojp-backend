import * as mongoose from 'mongoose';
import { AppObject } from '../../commons/app.object';

const UploadModelSchema = new mongoose.Schema(
  {
    publicId: { type: String, require: true },
    publicUrl: { type: String, require: true },
  },
  {
    timestamps: true,
  },
);

const UploadModel: mongoose.Model<any, any, any, any, any> = new mongoose.Model(
  AppObject.MONGO.COLLECTION.CATEGORIES,
  UploadModelSchema,
);

export default UploadModel;
