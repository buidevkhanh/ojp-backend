import { MongooseRepository } from '../../libs/databases/mongoose.repository';
import UploadModel from './upload.collection';

class UploadORM extends MongooseRepository<typeof UploadModel> {
  constructor() {
    super(UploadModel);
  }
}

export const UploadRepository = new UploadORM();
