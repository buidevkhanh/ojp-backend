import mongoose, { mongo } from "mongoose";
import { AppError } from "../../libs/errors/app.error";
import { ProblemRepository } from "../problems/problem.repository";
import { ReactionRepository } from "./reactions/reaction.repository";
import { UserRepository } from "../users/user.repository"
import { CommentRepository } from "./comment.repository";
import { ReplyRepository } from "./replies/reply.repository";

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
    const comments = await CommentRepository.TSchema.find({problem: new mongoose.Types.ObjectId(problemId)})
    .populate([{path: 'user', select: 'displayName avatar'}])
    .sort({createdAt: -1});
    const newComments: any[]= [];
    for(let i = 0; i < comments.length; i++) {
        const item = comments[i];
        const [agreement, replies] = await Promise.all([
            ReactionRepository.TSchema.count({target: item._id, reactionType: "agreement"}),
            ReplyRepository.TSchema.find({comment: item._id},{user: 1, content: 1, createdAt: 1, updatedAt: 1})
            .sort({createdAt: -1})
            .populate({path: 'user', select: 'displayName avatar'})
        ])
        //const agreement = await ReactionRepository.TSchema.count({target: item._id, reactionType: "agreement"});
        //const replies = await ReplyRepository.TSchema.find({comment: item._id},{user: 1, content: 1, createdAt: 1, updatedAt: 1}).sort({createdAt: -1}).populate({path: 'user', select: 'displayName avatar'});
        const newReplies: any = [];
        for(let i = 0; i < replies.length; i++) {
            const rp = replies[i];
            const agreement = await ReactionRepository.TSchema.count({target: rp._id, reactionType: "agreement"});
            newReplies.push({...rp.toObject(), agreement});
        }
        newComments.push({
            ...item.toObject(),
            agreement,
            replies: newReplies
        });
    };

    return newComments;
}

async function replyComment(commentId, content, nameOrEmail) {
    const [commentFound, userFound] = await Promise.all([
        CommentRepository.findOneByCondition({_id: new mongoose.Types.ObjectId(commentId)}),
        UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]})
    ]);
    if(!commentFound) {
        throw new AppError('Comment not found', 400);
    }
    if(!userFound) {
        throw new AppError('User not found', 400);
    }
    await ReplyRepository.createOne({user: userFound._id.toString(), comment: commentId, content});
}

async function updateReply(replyId, nameOrEmail, content) {
    const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    if(!userFound) {
        throw new AppError('User not found', 400);
    }
    const replyFound = await ReplyRepository.findOneByCondition({_id: new mongoose.Types.ObjectId(replyId), user: userFound._id});
    if(!replyFound) {
        throw new AppError('Reply not found', 400);
    }
    replyFound.content = content;
    await replyFound.save();
}

async function removeReply(replyId, nameOrEmail) {
    const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    if(!userFound) {
        throw new AppError('User not found', 400);
    }
    const replyFound = await ReplyRepository.findOneByCondition({_id: new mongoose.Types.ObjectId(replyId), user: userFound._id});
    if(!replyFound) {
        throw new AppError('Reply not found', 400);
    }
    await ReplyRepository.TSchema.deleteOne({_id: new mongoose.Types.ObjectId(replyId), user: userFound._id});
}

async function createReaction(reactionType, targetId, nameOrEmail) {
    const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    if(!userFound) {
        throw new AppError('User not found', 400);
    }
    const [commentFound, replyFound, reactionFound] = await Promise.all([
        CommentRepository.findOneByCondition({_id: new mongoose.Types.ObjectId(targetId)}),
        ReplyRepository.findOneByCondition({_id: new mongoose.Types.ObjectId(targetId)}),
        ReactionRepository.findOneByCondition({target: new mongoose.Types.ObjectId(targetId), user: userFound})
    ]);
    if(!commentFound && !replyFound) {
        throw new AppError(`Target not found`, 400);
    }
    if(reactionFound) {
        await ReactionRepository.TSchema.deleteOne({_id: reactionFound._id});
    }
    else await ReactionRepository.createOne({user: userFound._id.toString(), target: targetId, reactionType});
}

async function getOwnReaction(nameOrEmail, targetId) {
    const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    if(!userFound) {
        throw new AppError('User not found', 400);
    }
    const reactionFound = await ReactionRepository.findOneByCondition({target: new mongoose.Types.ObjectId(targetId), user: userFound});
    return reactionFound;
}

async function changeReaction(nameOrEmail, targetId, reactionType) {
    const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    if(!userFound) {
        throw new AppError('User not found', 400);
    }
    const reactionFound = await ReactionRepository.findOneByCondition({target: new mongoose.Types.ObjectId(targetId), user: userFound});
    if(reactionFound.reactionType === reactionType) {
        await ReactionRepository.TSchema.deleteOne({target: new mongoose.Types.ObjectId(targetId), user: userFound})
    } else {
        reactionFound.reactionType = reactionType;
        await reactionFound.save();
    }
}

export async function getReaction(nameOrEmail, problemId) {
    const userFound = await UserRepository.findOneByCondition({$or: [{username: nameOrEmail}, {userEmail: nameOrEmail}]});
    const comments = await CommentRepository.TSchema.find({problem: new mongoose.Types.ObjectId(problemId)}).populate([{path: 'user', select: 'displayName avatar'}]).sort({createdAt: -1});
    const listTargetId: any = [];
    for(let i = 0; i < comments.length; i++) {
        const item = comments[i];
        listTargetId.push(comments[i]._id);
        const replies = await ReplyRepository.TSchema.find({comment: item._id},{user: 1, content: 1, createdAt: 1, updatedAt: 1}).sort({createdAt: -1}).populate({path: 'user', select: 'displayName avatar'});
        for(let i = 0; i < replies.length; i++) {
           listTargetId.push(replies[i]._id);
        }
    };

    const hasReaction = await ReactionRepository.TSchema.find({target: {$in: listTargetId}, user: userFound._id });

    const newHasReaction: any = hasReaction.map((item: any) => {
        return {
            target: item.target,
            type: item.reactionType
        }
    })

    return newHasReaction;
}

export default {
    createComment,
    updateComment,
    removeComment,
    getComment,
    replyComment,
    removeReply,
    updateReply,
    createReaction,
    getOwnReaction,
    changeReaction,
    getReaction
}