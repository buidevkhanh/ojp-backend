import { AppError } from '../../libs/errors/app.error';
import { CategoryRepository } from '../categories/category.repository';
import { ProblemRepository } from './problem.repository';
import { randomUUID } from 'crypto';
import { TestcaseRepository } from './testcases/testcase.repository';
import TestcaseModel from './testcases/testcase.collection';
import { AppObject } from '../../commons/app.object';
import userService from '../users/user.service';
import { SubmissionRepository } from '../submissions/submission.repository';
import { UserRepository } from '../users/user.repository';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

async function createProblem(problemInfo) {
  problemInfo.score = 1;
  if(problemInfo.status === AppObject.PROBLEM_LEVEL.MEDIUM) {
    Object.assign(problemInfo, { score: 3})
  }
  const existCategory = await CategoryRepository.TSchema.findById(
    problemInfo?.problemCategory,
  );
  if (!existCategory) {
    throw new AppError('Danh mục không đúng', 400);
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
    throw new AppError(`Bài toán không được tìm thấy`, 400);
  }
  if (
    existProblem.status !== AppObject.PROBLEM_STATUS.ACTIVE &&
    existProblem.status !== AppObject.PROBLEM_STATUS.INACTIVE
  ) {
    throw new AppError(`Không chấp nhận bài toán`, 400);
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
    throw new AppError(`Testcase không được tìm thấy`, 400);
  }
  if (testcaseInfo.input) existTestcase.input = testcaseInfo.input;
  if (testcaseInfo.output) existTestcase.output = testcaseInfo.output;
  await existTestcase.save();
}

async function updateProblem(problemId, problemInfo) {
  let newScore = -1;
  if(problemInfo.problemLevel) {
    if(problemInfo.problemLevel === AppObject.PROBLEM_LEVEL.MEDIUM) {
      Object.assign(problemInfo, { score: 3});
      newScore = 3;
    } else {
      Object.assign(problemInfo, { score: 1});
      newScore = 1;
    }
  }
  const existProblem: any = await ProblemRepository.TSchema.findById(problemId);
  if (!existProblem) {
    throw new AppError(`Không tìm thấy bài toán`, 400);
  }
  const oldScore = existProblem.score;
  if( newScore !== -1) {
    const insc = newScore - oldScore;
    const userDone: any[] = await SubmissionRepository.TSchema.find({contest: null, status: AppObject.SUBMISSION_STATUS.AC, problem: existProblem._id}, {user: 1, score: 1});
    userDone.forEach(async (user) => {
      const userFound: any = await UserRepository.TSchema.findOne({_id: user.user});
      userFound.score = userFound.score + insc;
      userFound.save();
    })
  }
  for (const key in problemInfo) {
      
      existProblem[key] = problemInfo[key];
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
    throw new AppError(`Không tìm thấy bài toán`, 400);
  }
  return existProblem;
}

async function addTestcase(problemId, testcaseInfo) {
  const existProblem: any = await ProblemRepository.TSchema.findById(problemId);
  if (!existProblem) {
    throw new AppError(`Không tìm thấy bài toán`, 400);
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

async function getActiveProblem(params, user?) {
  Object.assign(params, {
    populate: {
      path: 'problemCategory',
      model: AppObject.MONGO.COLLECTION.CATEGORIES,
    },
    projections: {
      "problemName": 1,
      "problemCode": 1,
      "score": 1,
      "problemLevel": 1
    }
  });
  const problems = await ProblemRepository.getAllWithPaginate(params);
  if(user) {
    const newList: any = [];
    const existUser = await userService.findUser({$or: [{username: user},{userEmail: user}]});
    const userId = existUser._id;
    for(let i = 0; i < problems.data.length; i++) {
      const item = problems.data[i];
      const isDone = await SubmissionRepository.findOneByCondition({problem: item._id, user: userId, status: AppObject.SUBMISSION_STATUS.AC});
      if(isDone) {
        newList.push(Object.assign(problems.data[i].toObject(), { isDone: true}));
      } else {
        newList.push(Object.assign(problems.data[i].toObject(), { isDone: false}));
      }
    };
    problems.data = newList;
  }
  return problems;
}

async function userGetDetail(code) {
  const result: any = await ProblemRepository.TSchema.findOne({
    status: AppObject.PROBLEM_STATUS.ACTIVE,
    problemCode: code,
  }).populate([{ path: 'problemCategory' }, { path: 'problemCases' }]);

  if (!result) {
    throw new AppError(`Không tìm thấy bài toán`, 400);
  }
  const example = result.problemCases[0];
  return Object.assign(result.toObject(), { example, problemCases: 'Not public'});
}

async function statistic() {
  const [users, problems, submissions] = await Promise.all([
    UserRepository.TSchema.count({status: AppObject.ACCOUNT_STATUS.VERIFIED}),
    ProblemRepository.TSchema.count({status: AppObject.COMMON_STATUS.ACTIVE}),
    SubmissionRepository.TSchema.count({})
  ]);

  return {
    totalUser: users,
    totalProblem: problems,
    totalSubmission: submissions
  }
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
  statistic
};
