import { NextFunction, Request, Response } from "express";
import contestService from "./contest.service";

async function createContest(req: Request, res: Response, next: NextFunction) {
    try {
        await contestService.createContest(req.body);
        res.status(200).json({ok: true});
    } catch (error) {
        next(error);   
    }
}

async function adminList(req: Request, res: Response, next: NextFunction) {
    try {
        const {page, pageSize} = req.query;
        const result = await contestService.adminList({page, pageSize});
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

async function userList(req: Request, res:Response, next: NextFunction) {
    try {
        const {page, pageSize, time} = req.query;
        const conditions = {};
        const result = await contestService.userList({page, pageSize});
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

async function userRegister(req: Request, res: Response, next: NextFunction) {
    try {
        await contestService.userRegister(req.params.id, (req as any)?.payload?.nameOrEmail);
        res.status(200).json({ok: true});
    } catch (error) {
        next(error);
    }
}

async function userListOwn(req: Request, res: Response, next: NextFunction) {
    try {
        const { time } = req.query;
        const result = await contestService.userListOwn((req as any).payload.nameOrEmail, time);
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export default {
    createContest,
    adminList,
    userList,
    userRegister,
    userListOwn
}