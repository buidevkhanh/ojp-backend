import { NextFunction, Request, Response } from "express";
import submissionService from "./submission.service";

async function getSubmission(req: Request, res: Response, next: NextFunction) {
    try {
        const { page, pageSize, sort, author} = req.query; 
        const user = author === 'me' ? (req as any).payload?.nameOrEmail : null;
        const result = await submissionService.listAll({page, pageSize, sort}, user);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function detail(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await submissionService.detail(req.params.id, (req as any).payload?.nameOrEmail);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export default {
    getSubmission,
    detail
}