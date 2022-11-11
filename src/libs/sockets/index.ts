import { Application } from 'express';
import { Server } from 'socket.io';
import process from 'child_process';
import http from 'http';
import fs from 'fs';
import single from 'signale';
import { AppObject } from '../../commons/app.object';
import { executeFile } from '../executes';
import path from 'path';

export default function initialSocket(app: Application) {
    const server = http.createServer(app);
    const socket = new Server(server, { cors: { origin: "*"}});
   
    // Socket action
    socket.on('connection', (client) => {
        client.on(AppObject.SOCKET.ACTIONS.ACTION_SUBMIT_PROBLEM, (data) => {
            const uuid = require('uuid').v1();
            let tempFilename = uuid;
            switch(data.language) {
                case 'java': {
                    tempFilename = 'Main' + Number(new Date());
                    data.code = data.code.replace(new RegExp('package[ ]{1,}[^ ]{1,}[ ]{0,};'), "");
                    data.code = data.code.replace(new RegExp('public[ ]{1,}class[ ]{1,}[A-Za-z][A-Za-z0-9]{0,}[ ]{0,}{'), `public class ${tempFilename} {`);
                    tempFilename += ".java";
                    break;
                }
                case 'cpp': {
                    tempFilename += ".cpp";
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
        });

        client.on(AppObject.SOCKET.ACTIONS.ACTION_RUNCODE, (data) => {
            const uuid = require('uuid').v1();
            let tempFilename = uuid;
            switch(data.language) {
                case 'java': {
                    tempFilename = 'Main' + Number(new Date());
                    data.code = data.code.replace(new RegExp('package[ ]{1,}[^ ]{1,}[ ]{0,};'), "");
                    data.code = data.code.replace(new RegExp('public[ ]{1,}class[ ]{1,}[A-Za-z][A-Za-z0-9]{0,}[ ]{0,}{'), `public class ${tempFilename} {`);
                    tempFilename += ".java";
                    break;
                }
                case 'cpp': {
                    tempFilename += ".cpp";
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