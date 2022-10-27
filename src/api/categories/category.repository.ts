import { MongooseRepository } from '../../libs/databases/mongoose.repository';
import CategoryModel from './category.collection';

class CategoryORM extends MongooseRepository<typeof CategoryModel> {
  constructor() {
    super(CategoryModel);
  }
}

export const CategoryRepository = new CategoryORM();
