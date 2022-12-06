import { MongooseRepository } from '../../../libs/databases/mongoose.repository';
import ReplyModel from './reply.collection';

class ReplyORM extends MongooseRepository<typeof ReplyModel> {
  constructor() {
    super(ReplyModel);
  }
}

export const ReplyRepository = new ReplyORM();
