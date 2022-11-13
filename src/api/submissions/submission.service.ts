import { AppError } from "../../libs/errors/app.error";
import userService from "../users/user.service";
import { SubmissionRepository } from "./submission.repository"
import  jwtService  from '../../commons/jwt';
import mongoose from "mongoose";
import { UserRepository } from "../users/user.repository";

async function createSubmission(submissionInfo) {
    if(!submissionInfo.token) {
        throw new AppError(`InvalidToken`, 400);
    }
    const nameOrEmail = jwtService.verifyToken(submissionInfo.token as string).nameOrEmail;
    const existUser = await userService.findUser({$or: [{username: nameOrEmail},{userEmail: nameOrEmail}]});
    if(!existUser) {
        throw new AppError(`UserNotFound`, 400);
    } 
    delete submissionInfo.token;
    Object.assign(submissionInfo, { user: existUser._id});
    const result = await SubmissionRepository.TSchema.create(submissionInfo);
    return result;
}

async function updateSubmission(submissionId, { memory, executeTime, passPercent, detail, status}) {
    const existSubmit:any = await SubmissionRepository.TSchema.findById(submissionId);
    if(!existSubmit) {
        throw new AppError(`SubmissionNotFound`, 400);
    }
    if(memory) existSubmit.memory = memory;
    if(executeTime) existSubmit.executeTime = executeTime;
    if(passPercent) existSubmit.passPercent = passPercent;
    if(detail) existSubmit.detail = detail;
    if(status) existSubmit.status = status;
    await existSubmit.save();
}

async function listAll(paginate, author) {
    const params = {
        paginate,
        conditions: {},
        populate: [{
            path: 'problem',
            select: ['problemName','problemCode']
        },{
            path: 'user',
            select: 'displayName'
        }]
    }
    if(author) {
        const existUser = await userService.findUser({$or: [{username: author},{userEmail: author}]});
        Object.assign(params.conditions, { user: existUser._id});
    }
    return SubmissionRepository.getAllWithPaginate(params);
}

async function detail(submissionId, user) {
    const existUser = await userService.findUser({$or: [{username: user},{userEmail: user}]});
    const existSubmit = await SubmissionRepository.findOneByCondition({_id: new mongoose.Types.ObjectId(submissionId), user: existUser._id});
    if(!existSubmit) {
        throw new AppError(`PermissionDenied`, 400);
    }
    const returnSubmit = existSubmit.toObject();
    if(!returnSubmit.language) {
        returnSubmit.language = 'cpp';
    }
    return returnSubmit;
}

export default {
    createSubmission,
    updateSubmission,
    listAll,
    detail
}