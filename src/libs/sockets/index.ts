import { Application } from 'express';
import { Server } from 'socket.io';
require('promise');
import http from 'http';
import fs from 'fs';
import single from 'signale';
import { AppObject } from '../../commons/app.object';
import { compile, executeFile, submit } from '../executes';
import path from 'path';
import problemService from '../../api/problems/problem.service';
import { cppChangeContent, javaChangeContent } from '../utils/code.util';
import submissionService from '../../api/submissions/submission.service';
import SubmissionModel from '../../api/submissions/submission.collection';
import contestService from '../../api/contests/contest.service';
import ContestHistoryModel from '../../api/contests/contest-histories/contest-history.collection';

export default function initialSocket(app: Application) {
    const server = http.createServer(app);
    const socket = new Server(server, { cors: { origin: "*"}});
   
    // Socket action
    socket.on('connection', async (client) => {
        SubmissionModel.watch().on('change', () => {
            client.emit(AppObject.SOCKET.RESPONSE.HOOK_SUBMISSION, { change: 1});
        })

        ContestHistoryModel.watch().on('change', () => {
            client.emit('has_update', { change: 1});
        })

        client.on(AppObject.SOCKET.ACTIONS.ACTION_SUBMIT_PROBLEM, async (data) => {
            const uuid = require('uuid').v1();
            let tempFilename = uuid;
            let passPercent: any = 0;
            let totalPass = 0;
            let submitResult: { status: any, code: string, detail: any, time: any, memory: any} = { status: null, code: data.code, detail: null, time: 0, memory: 0};
            const submisson = await submissionService.createSubmission({
                token: data.token, 
                problem: data.problem._id, 
                userCode: submitResult.code, 
                language: data.language
            })
            switch(data.language) {
                case 'java': {
                    tempFilename = 'Main' + Number(new Date());
                    data.code =  `import java.util.*;\n${data.code}`;
                    data.code = data.code.replace(new RegExp('package[ ]{1,}[^ ]{1,}[ ]{0,};'), "");
                    data.code = data.code.replace(new RegExp('public[ ]{1,}class[ ]{1,}[A-Za-z][A-Za-z0-9_-]{0,}[ ]{0,}{'), `public class ${tempFilename} {`);
                    tempFilename += ".java";
                    break;
                }
                case 'cpp': {
                    data.code = cppChangeContent(data.code);
                    tempFilename += ".cpp";
                    break;
                }
                default: break;
            }
            const tempFolder = path.join(__dirname,'temps');
            fs.writeFile(path.join(tempFolder, tempFilename), data.code, async (err) => {
                if(err)
                    single.error(`System initial temporary file error: ${err}`);
                else {
                   compile(tempFolder, tempFilename, data.language).then(async (compiled) => {
                        if(compiled.status) {
                            submitResult.status = compiled.status;
                            submitResult.detail = compiled.detail;
                            submissionService.updateSubmission(submisson._id.toString(),{
                                memory: submitResult.memory, 
                                executeTime: submitResult.time, 
                                passPercent, 
                                detail: submitResult.detail, 
                                status: submitResult.status
                            });
                        } else {
                        const problemDetail: any = await problemService.getDetail(data.problem._id);
                        const testcase: any[] = problemDetail.problemCases;
                        const handleRunntest: any[]= [];
                        for(let i = 0, length = testcase.length; i < length; i++) {
                            handleRunntest.push(submit(data.language, compiled.detail , testcase[i].input, tempFilename, tempFolder));
                        }
                        Promise.all(handleRunntest).then((runResult) => {
                            let maxExecuteTime = 0;
                            let maxMemory = 0;
                            for(let i = 0, length = runResult.length; i < length; i++) {
                                const runner = runResult[i];
                                maxExecuteTime = Math.max(maxExecuteTime, runner.time);
                                maxMemory = Math.max(maxMemory, runner.memory);
                                if(runner.status) {
                                    submitResult.status = runner.status;
                                    submitResult.time = runner.time;
                                    submitResult.memory = runner.memory;
                                    break;
                                }
                                else if(testcase[i].output.replace(/[ ]{0,}\r\n/g,'\n').trim() != runner.output.replace(/[ ]{0,}\r\n/g,'\n').trim()) {
                                    submitResult.status = AppObject.SUBMISSION_STATUS.WA;
                                    submitResult.time = maxExecuteTime;
                                    submitResult.memory = runner.memory;
                                } else {
                                    totalPass++;
                                    passPercent = ((totalPass / length) * 100).toFixed(2);
                                }
                            }
                            if(!submitResult.status) {
                                submitResult.status = AppObject.SUBMISSION_STATUS.AC;
                                submitResult.time = maxExecuteTime;
                                submitResult.memory = maxMemory;
                           }
                           submissionService.updateSubmission(submisson._id.toString(),{
                            memory: submitResult.memory, 
                            executeTime: submitResult.time, 
                            passPercent, 
                            detail: submitResult.detail, 
                            status: submitResult.status
                        });
                        }).finally(async() => {
                            try {
                                switch(data.language) {
                                    case "cpp": {
                                        await fs.unlinkSync(path.join(tempFolder, tempFilename));
                                        await fs.unlinkSync(path.join(tempFolder, tempFilename.replace(".cpp",".exe")));
                                        break;
                                    }
                                    case "java": {
                                        await fs.unlinkSync(path.join(tempFolder, tempFilename));
                                        await fs.unlinkSync(path.join(tempFolder, tempFilename.replace(".java",".class")));
                                        break;
                                    }
                                }   
                            } catch {};
                        })
                   }
                })
                }
            })
        });

        client.on(AppObject.SOCKET.RESPONSE.JOIN_CONTEST, (data) => {
            try {
                contestService.userJoinContest(data.token, data.contestId);
            } catch {}
        });

        client.on(AppObject.SOCKET.ACTIONS.SUBMIT_CONTEST, async (data) => {
            if(!(await contestService.checkUserContest(data.token, data.contest))) {
                return;
            }
            Object.assign(data, { code: `${data.file}`});
            delete data.file;
            const uuid = require('uuid').v1();
            let tempFilename = uuid;
            let passPercent: any = 0;
            let totalPass = 0;
            let submitResult: { status: any, code: string, detail: any, time: any, memory: any} = { status: null, code: data.code, detail: null, time: 0, memory: 0};
            const submisson = await submissionService.createSubmission({
                token: data.token, 
                problem: data.problem._id, 
                userCode: submitResult.code, 
                language: data.language,
                contest: data.contest,
            });
            await contestService.userSubmit(data.token, data.contest, submisson._id.toString());
            switch(data.language) {
                case 'java': {
                    tempFilename = 'Main' + Number(new Date());
                    data.code = data.code.replace(new RegExp('package[ ]{1,}[^ ]{1,}[ ]{0,};'), "");
                    data.code = data.code.replace(new RegExp('public[ ]{1,}class[ ]{1,}[A-Za-z][A-Za-z0-9_-]{0,}[ ]{0,}{'), `public class ${tempFilename} {`);
                    tempFilename += ".java";
                    data.code = javaChangeContent(data.code);
                }
                case 'cpp': {
                    data.code = cppChangeContent(data.code);
                    tempFilename += ".cpp";
                    break;
                }
                default: break;
            }
            const tempFolder = path.join(__dirname,'temps');
            fs.writeFile(path.join(tempFolder, tempFilename), data.code, async (err) => {
                if(err)
                    single.error(`System initial temporary file error: ${err}`);
                else {
                   compile(tempFolder, tempFilename, data.language).then(async (compiled) => {
                        if(compiled.status) {
                            submitResult.status = compiled.status;
                            submitResult.detail = compiled.detail;
                            submissionService.updateSubmission(submisson._id.toString(),{
                                memory: submitResult.memory, 
                                executeTime: submitResult.time, 
                                passPercent, 
                                detail: submitResult.detail, 
                                status: submitResult.status
                            });
                        } else {
                        const problemDetail: any = await problemService.getDetail(data.problem._id);
                        const testcase: any[] = problemDetail.problemCases;
                        const handleRunntest: any[]= [];
                        for(let i = 0, length = testcase.length; i < length; i++) {
                            handleRunntest.push(submit(data.language, compiled.detail , testcase[i].input, tempFilename, tempFolder));
                        }
                        Promise.all(handleRunntest).then((runResult) => {
                            let maxExecuteTime = 0;
                            let maxMemory = 0;
                            for(let i = 0, length = runResult.length; i < length; i++) {
                                const runner = runResult[i];
                                maxExecuteTime = Math.max(maxExecuteTime, runner.time);
                                maxMemory = Math.max(maxMemory, runner.memory);
                                if(runner.status) {
                                    submitResult.status = runner.status;
                                    submitResult.time = runner.time;
                                    submitResult.memory = runner.memory;
                                    break;
                                }
                                else if(testcase[i].output.replace(/[ ]{0,}\r\n/g,'\n').trim() != runner.output.replace(/[ ]{0,}\r\n/g,'\n').trim()) {
                                    submitResult.status = AppObject.SUBMISSION_STATUS.WA;
                                    submitResult.time = maxExecuteTime;
                                    submitResult.memory = runner.memory;
                                } else {
                                    totalPass++;
                                    passPercent = ((totalPass / length) * 100).toFixed(2);
                                }
                            }
                            if(!submitResult.status) {
                                submitResult.status = AppObject.SUBMISSION_STATUS.AC;
                                submitResult.time = maxExecuteTime;
                                submitResult.memory = maxMemory;
                           }
                           submissionService.updateSubmission(submisson._id.toString(),{
                            memory: submitResult.memory, 
                            executeTime: submitResult.time, 
                            passPercent, 
                            detail: submitResult.detail, 
                            status: submitResult.status
                        });
                        }).finally(async() => {
                            try {
                                switch(data.language) {
                                    case "cpp": {
                                        await fs.unlinkSync(path.join(tempFolder, tempFilename));
                                        await fs.unlinkSync(path.join(tempFolder, tempFilename.replace(".cpp",".exe")));
                                        break;
                                    }
                                    case "java": {
                                        await fs.unlinkSync(path.join(tempFolder, tempFilename));
                                        await fs.unlinkSync(path.join(tempFolder, tempFilename.replace(".java",".class")));
                                        break;
                                    }
                                }   
                            } catch {};
                        })
                   }
                })
                }
            })
        });

        client.on('finish', (data) => {
            contestService.userFinishContest(data.token, data.contest);
        })

        client.on(AppObject.SOCKET.ACTIONS.ACTION_RUNCODE, (data) => {
            const uuid = require('uuid').v1();
            let tempFilename = uuid;
            switch(data.language) {
                case 'java': {
                    tempFilename = 'Main' + Number(new Date());
                    data.code = data.code.replace(new RegExp('package[ ]{1,}[^ ]{1,}[ ]{0,};'), "");
                    data.code = data.code.replace(new RegExp('public[ ]{1,}class[ ]{1,}[A-Za-z][A-Za-z0-9_-]{0,}[ ]{0,}{'), `public class ${tempFilename} {`);
                    tempFilename += ".java";
                    data.code = javaChangeContent(data.code);
                    break;
                }
                case 'cpp': {
                    tempFilename += ".cpp";
                    data.code = cppChangeContent(data.code);
                    break;
                }
                default: break;
            }
            const tempFolder = path.join(__dirname,'temps');
            fs.writeFile(path.join(tempFolder, tempFilename), data.code, (err) => {
                if(err)
                    single.error(`System initial temporary file error: ${err}`);
                else {
                   executeFile(client, tempFolder, tempFilename, data.language, data.input);
                }
            })
        })
    })

    return server;
}