import mongoose, { Types } from "mongoose";
import { AppObject } from "../../commons/app.object";
import jwt from "../../commons/jwt";
import { AppError } from "../../libs/errors/app.error";
import { ProblemRepository } from "../problems/problem.repository";
import { UserRepository } from "../users/user.repository";
import { ContestHistoryRepository } from "./contest-histories/contest-history.repository";
import { ContestRepository } from "./contest.repository";
import * as signale from 'signale';
import format from 'format-duration';
import ContestHistoryModel from "./contest-histories/contest-history.collection";

async function createContest(contest) {
    const name = contest.name;
    const existContest = await ContestRepository.findOneByCondition({name: {$regex: name, $options: 'i'}});
    if(existContest) {
        throw new AppError('Contest name already exist', 400);
    }
    const created: any = await ContestRepository.createWithReturn(contest);
    const closeAt = structuredClone(created.beginAt) as Date;
    closeAt.setHours(closeAt.getHours() + created.duration);
    created.closeAt = closeAt;
    await created.save();
}

async function adminList({page, pageSize}) {
    const params = {
        paginate: {
            page: page || 1, 
            pageSize: pageSize || 20,
            sort: 'beginAt:-1'
        },
        populate: [
            {path: 'questions.problem', select: '_id problemName'}
        ]
    }
    return ContestRepository.getAllWithPaginate(params);
}

async function userList({page, pageSize}) {
    const params = {
        paginate: {
            page: page || 1, 
            pageSize: pageSize || 20,
            sort: 'beginAt:-1'
        },
        conditions: {
            beginAt: {$gt: new Date()}
        }
    }
    const list:any = await ContestRepository.getAllWithPaginate(params);
    list.data = list.data.map((item) => {
        item = item.toObject();
        const users = item.user.length;
        delete item.user;
        if(typeof item.limitedMember === 'number') {
            Object.assign(item, {remainMember: item.limitedMember - users});
        } else {
            Object.assign(item, {remainMember: 'No limit'});
        }
        Object.assign(item, {users});
        return item;
    });
    return list;
}


async function userListOwn(userId, time) {
    const userFound = await UserRepository.findOneByCondition({$or: [{username: userId},{userEmail: userId}]});
    const params = {
        paginate: {
            page: 1, 
            pageSize: -1,
            sort: 'beginAt:-1'
        },
        conditions: {}
    }
    if(time === 'previous') {
        Object.assign(params.conditions, { closeAt: {$lt: new Date()}});
    } else if(time === 'current') {
        Object.assign(params.conditions, { closeAt: {$gt: new Date()}});
    }
    Object.assign(params.conditions, {user: userFound._id.toString()});
    const list:any = await ContestRepository.getAllWithPaginate(params);
    list.data = list.data.map((item) => {
        item = item.toObject();
        const users = item.user.length;
        delete item.user;
        if(typeof item.limitedMember === 'number') {
            Object.assign(item, {remainMember: item.limitedMember - users});
        } else {
            Object.assign(item, {remainMember: 'No limit'});
        }
        Object.assign(item, {users});
        return item;
    });
    return list;
}

async function userRegister(contestId, nameOrEmail) {
    const contestFound: any = await ContestRepository.findOneByCondition({_id: new mongoose.Types.ObjectId(contestId)});
    if(!contestFound) {
        throw new AppError('Contest not found', 400);
    }
    const userFound: any = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    if(!userFound) {
        throw new AppError('User not found', 400);
    }
    const member = contestFound.user;
    if(typeof contestFound.limitedMember == 'number' && member.length === contestFound.limitedMember) {
        throw new AppError('Contest is full', 400);
    }
    let isExist = false;
    for(let i = 0; i < member.length; i++) {
        if(member[i].toString() === userFound._id.toString()) {
            isExist = true;
            break;
        }
    }
    if(isExist) {
        throw new AppError('User already register', 400);
    }
    member.push(userFound._id.toString());
    await contestFound.save();
    await addHistory(userFound._id.toString(), contestFound._id.toString())
}

async function addHistory(userId, contestId) {
    await ContestHistoryRepository.createOne({user: userId, contest: contestId, history: []});
}

async function userJoinContest(userToken, contestId) {
    const { nameOrEmail } = jwt.verifyToken(userToken);
    const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    if(!userFound) {
        return;
    }
    await ContestHistoryRepository.TSchema.updateOne({user: userFound._id, contest: new Types.ObjectId(contestId), status: {$eq: AppObject.CONTEST_STATUS.NOT_JOIN}}, { $set: { status: AppObject.CONTEST_STATUS.PROCESSING}});
}

async function userSubmit(userToken, contestId, submission) {
    const { nameOrEmail } = jwt.verifyToken(userToken);
    const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    if(!userFound) {
        return;
    }
    const history = await ContestHistoryRepository.findOneByCondition({user: userFound._id, contest: new Types.ObjectId(contestId)});
    history.history.unshift(submission);
    await history.save();
}

async function userGetContestHistory(nameOrEmail, contestId) {
    const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    if(!userFound) {
        throw new AppError('User not found', 400);
    }
    const history = await ContestHistoryRepository.TSchema.findOne({user: userFound._id, contest: new Types.ObjectId(contestId)}).populate({
        path: 'history'
    });
    return history;
}

async function checkUserContest(userToken, contestId) {
    if(!userToken) return false;
    const { nameOrEmail } = jwt.verifyToken(userToken);
    const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    if(!userFound) {
        return false;
    }
    const history = await ContestHistoryRepository.findOneByCondition({user: userFound._id, contest: new Types.ObjectId(contestId)});
    if(!history || !(history.status === AppObject.CONTEST_STATUS.PROCESSING)) {
        return false;
    }
    return true;
}

async function autoEndContest() {
    const historyList = await ContestHistoryRepository.TSchema.aggregate([
        {   
            $lookup: {
                from: 'contests',
                localField: 'contest',
                foreignField: '_id',
                as: 'contest'
            }, 
        }, {
            $unwind: {
                path: '$contest',
                preserveNullAndEmptyArrays: true
            }
        }, {
            $match: {
                'status': {$ne: AppObject.CONTEST_STATUS.DONE},
                'contest.closeAt': {$lt: new Date()}
            }
        }
    ]);

    for(let i = 0; i < historyList.length; i++) {
        historyList[i].status = AppObject.CONTEST_STATUS.DONE;
        await ContestHistoryRepository.TSchema.updateOne({_id: historyList[i]}, {$set: {status: AppObject.CONTEST_STATUS.DONE}});
        signale.complete(`[Cron] contest history ${historyList[i]._id} was done`);
    }
}

async function userFinishContest(userToken, contestId) {
    if(!userToken) return false;
    const { nameOrEmail } = jwt.verifyToken(userToken);
    const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    if(!userFound) {
        return;
    }
    const history = await ContestHistoryRepository.findOneByCondition({user: userFound._id, contest: new Types.ObjectId(contestId), status: {$nin: [AppObject.CONTEST_STATUS.NOT_JOIN, AppObject.CONTEST_STATUS.DONE]}});
    if(!history) {
        return;
    }
    history.status = AppObject.CONTEST_STATUS.DONE;
    await history.save();
}

async function userGetDetail(contestId, userId) {
    const userFound  = await UserRepository.findOneByCondition({$or: [{username: userId}, {userEmail: userId}]});
    const contestFound = await ContestRepository.findOneByCondition({_id: new mongoose.Types.ObjectId(contestId), user: userFound._id});
    if(!userFound) {
        throw new AppError('User not found', 400);
    }
    if(!contestFound) {
        throw new AppError('Contest not found', 400);
    }
    const newContest = contestFound.toObject();
    delete newContest.user;
    const newQuestion: any = [];
    for(let i = 0;  i < newContest.questions.length; i++) {
        const problem:any = await ProblemRepository.TSchema.findOne({_id: new mongoose.Types.ObjectId(newContest.questions[i].problem)}, {_id: 1, problemName: 1, problemQuestion: 1, expectedInput: 1, expectedOutput: 1, problemCases: 1}).populate({path: 'problemCases', select: ['input', 'output']});
        const newProblem = problem.toObject();
        Object.assign(newProblem, {example: newProblem.problemCases[0]});
        delete newProblem.problemCases;
        newQuestion.push({
            problem: newProblem,
            score: newContest.questions[i].score
        })
    }
    Object.assign(newContest, {questions: newQuestion});
    return newContest;
}

async function userGetScore(contestId, userId) {
    const userFound  = await UserRepository.findOneByCondition({$or: [{username: userId}, {userEmail: userId}]});
    const contestFound = await ContestRepository.findOneByCondition({_id: new mongoose.Types.ObjectId(contestId), user: userFound._id});
    let score = 0;
    if(!userFound) {
        throw new AppError('User not found', 400);
    }
    if(!contestFound) {
        throw new AppError('Contest not found', 400);
    }
    const history: any = await ContestHistoryRepository.TSchema.findOne({user: userFound._id, contest: new Types.ObjectId(contestId), status: AppObject.CONTEST_STATUS.DONE}).populate({path: 'history', select: ['problem', 'status']});
    if(!history) {
        throw new AppError('History not found', 400);
    }
    for(let i = 0;  i < contestFound.questions.length; i++) {
        const isCorrect = history.history.findIndex((item) => {
            return (item.problem.toString() === contestFound.questions[i].problem.toString() && item.status === AppObject.SUBMISSION_STATUS.AC)
        });
        if(isCorrect !== -1) score += Number(contestFound.questions[i].score);
    }
    const timeSpend = history.updatedAt - contestFound.beginAt;
    return {
        score,
        time: format(timeSpend)
    }
}

export default {
    createContest,
    adminList,
    userList,
    userRegister,
    userListOwn,
    addHistory,
    userGetDetail,
    userJoinContest,
    userSubmit,
    checkUserContest,
    userGetContestHistory,
    userFinishContest,
    autoEndContest,
    userGetScore
}