import { exist, object } from 'joi';
import * as mongoose from 'mongoose';
import { AppError } from '../../libs/errors/app.error';
import { CategoryRepository } from './category.repository';

async function createCategory(categoryInfo: {
  categoryName: string;
  categoryLogo: string;
}) {
  const existCategory = await CategoryRepository.findOneByCondition({
    categoryName: { $regex: categoryInfo.categoryName, $options: 'i' },
  });
  if (existCategory) {
    throw new AppError('CategoryNameIsExist', 400);
  }
  return CategoryRepository.createOne(categoryInfo);
}

async function updateCategory(categoryInfo: {
  categoryId?: string;
  categoryName?: string;
  categoryLogo?: string;
}) {
  const existCategory = await CategoryRepository.findOneByCondition({
    _id: new mongoose.Types.ObjectId(categoryInfo.categoryId),
  });

  if (!existCategory) {
    throw new AppError('CategoryIsNotExist', 400);
  }

  if (categoryInfo.categoryName) {
    existCategory.categoryName = categoryInfo.categoryName;
  }

  if (categoryInfo.categoryLogo) {
    existCategory.categoryLogo = categoryInfo.categoryLogo;
  }

  await existCategory.save();
}

async function deleteCategory(categoryId) {
  const existCategory = await CategoryRepository.findOneByCondition({
    _id: new mongoose.Types.ObjectId(categoryId),
  });
  if (!existCategory) {
    throw new AppError('CategoryNotFound', 400);
  }
  //check in used category

  // delete category
  await CategoryRepository.TSchema.deleteOne({
    _id: new mongoose.Types.ObjectId(categoryId),
  });
}

async function getAllCategory(params) {
  return CategoryRepository.getAllWithPaginate(params);
}

export default {
  createCategory,
  updateCategory,
  getAllCategory,
  deleteCategory,
};
