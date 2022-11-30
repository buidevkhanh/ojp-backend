import mongoose from "mongoose";
import { AppError } from "../../libs/errors/app.error";
import { ProblemRepository } from "../problems/problem.repository";
import { UserRepository } from "../users/user.repository";
import { ContestHistoryRepository } from "./contest-histories/contest-history.repository";
import { ContestRepository } from "./contest.repository"

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

async function userGetDetail(contestId, userId) {
    const userFound  = await UserRepository.findOneByCondition({$or: [{username: userId}, {userEmail: userId}]});
    const contestFound = await ContestRepository.findOneByCondition({_id: new mongoose.Types.ObjectId(contestId), user: userFound._id, beginAt: {$lte: new Date()}, closeAt: {$gte: new Date()}});
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

export default {
    createContest,
    adminList,
    userList,
    userRegister,
    userListOwn,
    addHistory,
    userGetDetail
}