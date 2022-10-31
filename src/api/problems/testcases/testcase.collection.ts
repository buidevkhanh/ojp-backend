import * as mongoose from 'mongoose';
import { AppObject } from '../../../commons/app.object';

const TestcaseModelSchemal = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    output: { type: String, default: '' },
  },
  {
    timestamps: true,
  },
);

const TestcaseModel: mongoose.Model<any, any, any, any, any> = mongoose.model(
  AppObject.MONGO.COLLECTION.TESTCASES,
  TestcaseModelSchemal,
);

export default TestcaseModel;
