import { NextFunction, Request, Response } from "express";
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

export default {
    createComment,
    updateComment,
    getComment,
    removeComment
}