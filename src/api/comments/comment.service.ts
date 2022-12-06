import mongoose, { mongo } from "mongoose";
import { AppError } from "../../libs/errors/app.error";
import { ProblemRepository } from "../problems/problem.repository";
import { ReactionRepository } from "../reactions/reaction.repository";
import { UserRepository } from "../users/user.repository"
import { CommentRepository } from "./comment.repository";

async function createComment(nameOrEmail, problemId, content ) {
    if(!content.trim()) {
        throw new AppError('Content invalid', 400);
    }
    const [userFound, problemFound] = await Promise.all([
        UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]}),
        ProblemRepository.findOneByCondition({_id: new mongoose.Types.ObjectId(problemId)})
    ]);
    if(!userFound) {
        throw new AppError('User not found', 400);
    }
    if(!problemFound) {
        throw new AppError('Problem not found', 400);
    }
    await CommentRepository.createOne({user: userFound._id.toString(), problem: problemFound._id.toString(), content});
}

async function updateComment(nameOrEmail,commentId, content) {
    const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    if(!userFound) {
        throw new AppError('User not found', 400);
    }
    const commentFound = await CommentRepository.findOneByCondition({_id: new mongoose.Types.ObjectId(commentId), user: userFound._id});
    if(!commentFound) {
        throw new AppError('Comment not found', 400);
    }
    commentFound.content = content;
    await commentFound.save();
}

async function removeComment(commentId, nameOrEmail){
    const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    if(!userFound) {
        throw new AppError('User not found', 400);
    }
    const commentFound = await CommentRepository.findOneByCondition({_id: new mongoose.Types.ObjectId(commentId), user: userFound._id});
    if(!commentFound) {
        throw new AppError('Comment not found', 400);
    }
    await CommentRepository.TSchema.deleteOne({_id: new mongoose.Types.ObjectId(commentId), user: userFound._id});
}

async function getComment(problemId, page) {
    const comments = await CommentRepository.TSchema.find({problem: new mongoose.Types.ObjectId(problemId)}).populate([{path: 'user', select: 'displayName'}]).sort({createdAt: -1}).limit(10).skip((page - 1)*10);
    const newComments: any[]= [];
    for(let i = 0; i < comments.length; i++) {
        const item = comments[i];
        const agreement = await ReactionRepository.TSchema.count({target: item._id, reactionType: "agreement"});
        const disagreement = await ReactionRepository.TSchema.count({target: item._id, reactionType: "disagreement"});
        newComments.push({
            ...item.toObject(),
            agreement,
            disagreement
        });
    };

    return newComments;
}

export default {
    createComment,
    updateComment,
    removeComment,
    getComment
}