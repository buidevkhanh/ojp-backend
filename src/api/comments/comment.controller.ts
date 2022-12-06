import { NextFunction, Request, Response } from "express";
import { Collection } from "mongoose";
import commentService from "./comment.service";

async function createComment(req: Request, res: Response, next: NextFunction) {
    try {
        const { content, problemId } = req.body;
        const nameOrEmail = (req as any).payload.nameOrEmail;
        await commentService.createComment(nameOrEmail, problemId, content);
        res.status(200).json({ok: true});
    } catch (error) {
        next(error);
    }
}

async function updateComment(req: Request, res: Response, next: NextFunction) {
    try {
        const { content, commentId} = req.body;
        const nameOrEmail = (req as any).payload.nameOrEmail;
        await commentService.updateComment(nameOrEmail, commentId, content);
        res.status(200).json({ok: true});
    } catch (error) {
        next(error);    
    }
}

async function getComment(req: Request, res: Response, next: NextFunction) {
    try {
        const page = req.query.page || 1;
        const result = await commentService.getComment(req.params.id, page);
        res.status(200).json({ data: result});
    } catch (error) {
        next(error);
    }
}

async function removeComment(req: Request, res: Response, next: NextFunction) {
    try {
        const nameOrEmail = (req as any).payload.nameOrEmail;
        await commentService.removeComment(req.params.id, nameOrEmail);
        res.status(200).json({ok: true});
    } catch (error) {
        next(error);
    }
}

async function createReply(req: Request, res: Response, next: NextFunction) {
    try {
        const { content, commentId } = req.body;
        const nameOrEmail = (req as any).payload.nameOrEmail;
        await commentService.replyComment(commentId, content, nameOrEmail);
        res.status(200).json({ok: true});
    } catch (error) {
        next(error);
    }
}

async function updateReply(req: Request, res: Response, next: NextFunction) {
    try {
        const { replyId, content} = req.body;
        const nameOrEmail = (req as any).payload.nameOrEmail;
        await commentService.updateReply(replyId, nameOrEmail, content);
        res.status(200).json({ok: true});
    } catch (error) {
        next(error);
    }
}

async function removeReply(req: Request, res: Response, next: NextFunction) {
    try {
        const nameOrEmail = (req as any).payload.nameOrEmail;
        await commentService.removeReply(req.params.id, nameOrEmail);
        res.status(200).json({ok: true});
    } catch (error) {
        next(error);
    }
}

async function createReaction(req: Request, res: Response, next: NextFunction) {
    try {
        const nameOrEmail = (req as any).payload.nameOrEmail;
        await commentService.createReaction(req.body.reactionType, req.body.target, nameOrEmail);
        res.status(200).json({ok: true});
    } catch (error) {
        next(error);    
    }
}

async function updateReaction(req: Request, res: Response, next: NextFunction) {
    try {
        const nameOrEmail = (req as any).payload.nameOrEmail;
        await commentService.changeReaction(nameOrEmail, req.body.target, req.body.reactionType);
        res.status(200).json({ok: true});
    } catch (error) {
        next(error);
    }
}

async function getOwn(req: Request, res: Response, next: NextFunction) {
    try {
        const nameOrEmail = (req as any).payload.nameOrEmail;
        const result = await commentService.getOwnReaction(nameOrEmail, req.params.id);
        res.status(200).json({data: result});
    } catch (error) {
        next(error);
    }
}

export default {
    createComment,
    updateComment,
    getComment,
    removeComment,
    createReply,
    updateReply,
    removeReply,
    createReaction,
    updateReaction,
    getOwn
}