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

const UploadModel: mongoose.Model<any, any, any, any, any> = mongoose.model(
  AppObject.MONGO.COLLECTION.UPLOADS,
  UploadModelSchema,
);

export default UploadModel;
