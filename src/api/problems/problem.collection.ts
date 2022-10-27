import * as mongoose from 'mongoose';
import { AppObject } from '../../commons/app.object';

const ProblemModelSchema = new mongoose.Schema(
  {
    problemName: { type: String, required: true },
    problemCode: { type: String, required: true },
    problemLevel: {
      type: String,
      enum: Object.values(AppObject.PROBLEM_LEVEL),
    },
    problemCategory: { type: mongoose.Types.ObjectId },
    problemQuestion: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const ProblemModel: mongoose.Model<any, any, any, any, any> = mongoose.model(
  AppObject.MONGO.COLLECTION.PROBLEMS,
  ProblemModelSchema,
);

export default ProblemModel;
