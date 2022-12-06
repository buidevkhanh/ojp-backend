import { MongooseRepository } from '../../libs/databases/mongoose.repository';
import ReactionModel from './reaction.collection';

class ReactionORM extends MongooseRepository<typeof ReactionModel> {
  constructor() {
    super(ReactionModel);
  }
}

export const ReactionRepository = new ReactionORM();
