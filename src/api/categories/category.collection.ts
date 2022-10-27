import * as mongoose from 'mongoose';
import { AppObject } from '../../commons/app.object';

const CategoryModelSchema = new mongoose.Schema(
  {
    categoryName: { type: String, require: true },
    categoryLogo: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      enum: Object.values(AppObject.COMMON_STATUS),
      default: AppObject.COMMON_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  },
);

const CategoryModel: mongoose.Model<any, any, any, any, any> = mongoose.model(
  AppObject.MONGO.COLLECTION.CATEGORIES,
  CategoryModelSchema,
);

export default CategoryModel;
