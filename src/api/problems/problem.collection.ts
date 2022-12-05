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
    expectedInput: { type: String, default: 'No input' },
    expectedOutput: { type: String, default: 'No output' },
    problemScope: {
      type: String,
      enum: Object.values(AppObject.APP_SCOPES),
      default: AppObject.APP_SCOPES.PUBLIC,
    },
    problemCases: {
      type: [mongoose.Types.ObjectId],
      ref: AppObject.MONGO.COLLECTION.TESTCASES,
    },
    status: {
      type: String,
      enum: Object.values(AppObject.PROBLEM_STATUS),
      default: AppObject.PROBLEM_STATUS.PENDING,
    },
    score: {
      type: Number,
      default: 1
    }
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
