import { MongooseRepository } from '../../libs/databases/mongoose.repository';
import CommentModel from './comment.collection';

class CommentORM extends MongooseRepository<typeof CommentModel> {
  constructor() {
    super(CommentModel);
  }
}

export const CommentRepository = new CommentORM();
