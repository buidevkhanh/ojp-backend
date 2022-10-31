import { AppError } from '../../libs/errors/app.error';
import { CategoryRepository } from '../categories/category.repository';
import { ProblemRepository } from './problem.repository';
import { randomUUID } from 'crypto';
import { TestcaseRepository } from './testcases/testcase.repository';
import TestcaseModel from './testcases/testcase.collection';
import { AppObject } from '../../commons/app.object';
import { exist } from 'joi';

async function createProblem(problemInfo) {
  const existCategory = await CategoryRepository.TSchema.findById(
    problemInfo?.problemCategory,
  );
  if (!existCategory) {
    throw new AppError('CategoryNotFound', 400);
  }

  try {
    const createTestcase = await Promise.all(
      problemInfo.problemCases.map((item) => {
        return TestcaseRepository.createWithReturn(item);
      }),
    );
    const problemCases = createTestcase.map((item) => {
      return item._id.toString();
    });
    const params = problemInfo;
    Object.assign(params, { problemCode: randomUUID() });
    Object.assign(params, { problemCases });
    Object.assign(params, { status: AppObject.PROBLEM_STATUS.ACTIVE });
    return ProblemRepository.createOne(problemInfo);
  } catch (error) {
    throw new AppError(error, 400);
  }
}

async function listByAdmin(params) {
  return ProblemRepository.getAllWithPaginate(params);
}

async function changeProblem(problemId) {
  const existProblem: any = await ProblemRepository.TSchema.findById(problemId);
  if (!existProblem) {
    throw new AppError(`ProblemNotFound`, 400);
  }
  if (
    existProblem.status !== AppObject.PROBLEM_STATUS.ACTIVE &&
    existProblem.status !== AppObject.PROBLEM_STATUS.INACTIVE
  ) {
    throw new AppError(`NotAcceptedProblem`, 400);
  }
  if (existProblem.status === AppObject.PROBLEM_STATUS.ACTIVE) {
    existProblem.status = AppObject.PROBLEM_STATUS.INACTIVE;
  } else {
    existProblem.status = AppObject.PROBLEM_STATUS.ACTIVE;
  }
}

export default {
  createProblem,
  listByAdmin,
  changeProblem,
};
