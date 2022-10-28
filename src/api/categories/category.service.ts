import { exist, object } from 'joi';
import * as mongoose from 'mongoose';
import { AppObject } from '../../commons/app.object';
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

async function detailById(id) {
  const existCategory = await CategoryRepository.TSchema.findById(id);
  if (!existCategory) {
    throw new AppError('categoryNotFound', 400);
  }
  return existCategory;
}

async function changeStatus(id) {
  const existCategory: any = await CategoryRepository.TSchema.findById(id);
  if (!existCategory) {
    throw new AppError('categoryNotFound', 400);
  }
  if (existCategory.status === AppObject.COMMON_STATUS.ACTIVE) {
    existCategory.status = AppObject.COMMON_STATUS.INACTIVE;
  } else existCategory.status = AppObject.COMMON_STATUS.ACTIVE;
  return existCategory.save();
}

export default {
  createCategory,
  updateCategory,
  getAllCategory,
  deleteCategory,
  detailById,
  changeStatus,
};
