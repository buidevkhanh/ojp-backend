import { MongooseRepository } from '../../libs/databases/mongoose.repository';
import ProblemModel from './problem.collection';

class ProblemORM extends MongooseRepository<typeof ProblemModel> {
  constructor() {
    super(ProblemModel);
  }
}

export const ProblemRepository = new ProblemORM();
