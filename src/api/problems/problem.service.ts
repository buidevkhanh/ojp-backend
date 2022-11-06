import { AppError } from '../../libs/errors/app.error';
import { CategoryRepository } from '../categories/category.repository';
import { ProblemRepository } from './problem.repository';
import { randomUUID } from 'crypto';
import { TestcaseRepository } from './testcases/testcase.repository';
import TestcaseModel from './testcases/testcase.collection';
import { AppObject } from '../../commons/app.object';
import { exist } from 'joi';
import mongoose, { mongo } from 'mongoose';
import { isAwaitExpression } from 'typescript';
import ProblemModel from './problem.collection';

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
  await existProblem.save();
}

async function deleteTestcase(testcaseIds: string[]) {
  const session = await TestcaseModel.startSession();
  session.startTransaction();
  try {
    await TestcaseRepository.TSchema.deleteMany({
      _id: { $in: testcaseIds },
    });
    const existProblems: any = await ProblemRepository.TSchema.find({
      problemCases: { $in: testcaseIds },
    });
    console.log(existProblems);
    for (let i = 0; i < existProblems.length; i++) {
      existProblems[i].problemCases = existProblems[i].problemCases.filter(
        (item) => {
          return !testcaseIds.includes(item._id.toString());
        },
      );
      await existProblems[i].save();
    }
    session.commitTransaction();
  } catch {
    session.abortTransaction();
  } finally {
    session.endSession();
  }
}

async function updateTestcase(
  testcaseId,
  testcaseInfo: { input: string; output: string },
) {
  const existTestcase: any = await TestcaseRepository.TSchema.findById(
    testcaseId,
  );
  if (!existTestcase) {
    throw new AppError(`TestcaseNotFound`, 400);
  }
  if (testcaseInfo.input) existTestcase.input = testcaseInfo.input;
  if (testcaseInfo.output) existTestcase.output = testcaseInfo.output;
  await existTestcase.save();
}

async function updateProblem(problemId, problemInfo) {
  const existProblem = await ProblemRepository.TSchema.findById(problemId);
  if (!existProblem) {
    throw new AppError(`ProblemNotFound`, 400);
  }
  for (const key in problemInfo) {
    if (Object.keys(existProblem.toObject()).includes(key)) {
      existProblem[key] = problemInfo[key];
    }
  }
  await existProblem.save();
}

async function getDetail(problemId) {
  const existProblem = await ProblemRepository.TSchema.findById(
    problemId,
  ).populate({
    path: 'problemCases',
  });
  if (!existProblem) {
    throw new AppError(`ProblemNotFound`, 400);
  }
  return existProblem;
}

async function addTestcase(problemId, testcaseInfo) {
  const existProblem: any = await ProblemRepository.TSchema.findById(problemId);
  if (!existProblem) {
    throw new AppError(`ProblemNotFound`, 400);
  }
  const testcaseIds = await Promise.all(
    testcaseInfo.map((item) => {
      return TestcaseRepository.TSchema.create({
        input: item.input,
        output: item.output,
      });
    }),
  );
  testcaseIds.forEach((item) => {
    existProblem.problemCases.push(item._id.toString());
  });
  await existProblem.save();
}

async function getActiveProblem(params) {
  Object.assign(params, {
    populate: {
      path: 'problemCategory',
      model: AppObject.MONGO.COLLECTION.CATEGORIES,
    },
  });
  return ProblemRepository.getAllWithPaginate(params);
}

async function userGetDetail(code) {
  const result: any = await ProblemRepository.TSchema.findOne({
    status: AppObject.PROBLEM_STATUS.ACTIVE,
    problemCode: code,
  }).populate([{ path: 'problemCategory' }, { path: 'problemCases' }]);

  if (!result) {
    throw new AppError(`problemNotFound`, 400);
  }
  const example = result.problemCases[0];
  delete result.problemCases;
  return Object.assign(result.toObject(), { example });
}

export default {
  createProblem,
  listByAdmin,
  changeProblem,
  deleteTestcase,
  updateTestcase,
  updateProblem,
  getDetail,
  addTestcase,
  getActiveProblem,
  userGetDetail,
};
