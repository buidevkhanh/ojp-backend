import { MongooseRepository } from '../../../libs/databases/mongoose.repository';
import TestcaseModel from './testcase.collection';

class TestcaseORM extends MongooseRepository<typeof TestcaseModel> {
  constructor() {
    super(TestcaseModel);
  }
}

export const TestcaseRepository = new TestcaseORM();
