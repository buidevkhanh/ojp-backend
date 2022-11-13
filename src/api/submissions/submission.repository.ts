import { MongooseRepository } from '../../libs/databases/mongoose.repository';
import SumissionModel from './submission.collection';

class SubmissionORM extends MongooseRepository<typeof SumissionModel> {
  constructor() {
    super(SumissionModel);
  }
}

export const SubmissionRepository = new SubmissionORM();
