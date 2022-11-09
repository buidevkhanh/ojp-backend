import pc from 'child_process';
import fs  from 'fs';
import pidusage from 'pidusage';
import path from 'path';
import { AppObject } from '../../commons/app.object';

export async function executeFile(client: any, folder: any, filename: any, language: any, input: any, className?: string) {
    const traceFile = require('uuid').v1() + ".log";
    switch(language) {
        case 'cpp': {
            const compiledPath = `${folder}\\${filename.split(".")[0]}.exe`;
            const args = ['-o', `${compiledPath}`, `${path.join(folder, filename)}`];
            const compiler = pc.spawn("g++", args);
            compiler.stderr.on(`data`, (data) => {
                let errorStr: string = `${data}`;
                errorStr = errorStr.replaceAll(path.join(folder, filename) + ":", "");
                client.emit(AppObject.SOCKET.RESPONSE.RESPONSE_RUNCODE, {isCompile: false,  output: null, error: errorStr, memory: 0, time: 0});
            })
            compiler.on('close', (code) => {
                if(code === 0) {
                    client.emit(AppObject.SOCKET.RESPONSE.RESPONSE_RUNCODE, {isCompile: true,  output: null, error: null});
                    const runner = pc.spawn(compiledPath, {detached: true, timeout: 20000});
                    runner.unref();

                    const beginExecute = new Date();
                    //const beginParentExcecute = await pidusage(process.pid);

                    if(input) {
                        runner.stdin.write(input);
                        runner.stdin.end();
                    }

                    pidusage(process.pid, (err, stats) => {
                        const content = `${stats.ctime}`;
                        require('fast-write-atomic')(path.join(path.join(__dirname, "traces"), traceFile), Buffer.from(content), ()=>{})
                    })

                    runner.stdout.on(`data`, async (data) => {
                        let dataStr: string = `${data}`;
                        const endExecute = new Date();
                        const executeTime = (Number(endExecute) - Number(beginExecute)) / 10;
                        dataStr = dataStr.replaceAll(path.join(folder, filename) + ":", "");
                        client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true,  output: executeTime <= 2000 ? `${dataStr}` : null, error:executeTime <= 2000? null : `Time limited exceeded`, time: executeTime, memory: 0});
                    });

                    runner.on('close', async (code) => {
                        if(code !== 0) {
                            client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true, output: null, error: `Runtime error`, time: 0, memory: 0});
                        } 
                        //client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE_TIME, stats)
                        pidusage(process.pid, (err, stats) => {
                            const content = `${stats.ctime}`;
                            require('fast-write-atomic')(path.join(path.join(__dirname, "traces"), traceFile), Buffer.from(content), ()=>{})
                        })
                        fs.unlinkSync(path.join(folder, filename));
                        fs.unlinkSync(compiledPath);
                    })

                    // Monitor process
                    

                } else {
                    fs.unlinkSync(path.join(folder, filename));
                    fs.renameSync(compiledPath, compiledPath.replace(".exe",".txt"));
                    fs.existsSync(compiledPath);
                    fs.unlinkSync(compiledPath.replace(".exe",".txt"));
                }
            });
            break;
        }
        case 'java': {
            const args = [`${path.join(folder, filename)}`];
            const compiler = pc.spawnSync("javac", args);
            if(!`${compiler.stderr}`) {
                    const runargs = [`${filename.replace(".java", "")}`];
                    client.emit(AppObject.SOCKET.RESPONSE.RESPONSE_RUNCODE, {isCompile: true,  output: null, error: null});
                    const runner = pc.spawn("java", runargs, {detached: true, timeout: 20000, cwd: path.normalize(folder)});
                    runner.unref();

                    const beginExecute = new Date();

                    if(input) {
                        runner.stdin.write(input);
                        runner.stdin.end();
                    }

                    runner.stdout.on(`data`, async (data) => {
                        let dataStr: string = `${data}`;
                        const endExecute = new Date();
                        const executeTime = (Number(endExecute) - Number(beginExecute)) / 10;
                        const pcInfo = pc.spawnSync('tasklist', ['/fi', `PID eq ${runner.pid}`]);
                        console.log(`${pcInfo.stdout}`);
                        dataStr = dataStr.replaceAll(path.join(folder, filename) + ":", "");
                        client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true,  output: executeTime <= 2000 ? `${dataStr}` : null, error:executeTime <= 2000? null : `Executing too long`, time: executeTime, memory: 0});
                    })

                    runner.stderr.on('data', (data) => {
                        console.log(`${data}`);
                    })

                    runner.on('close', () => {
                        //client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE_TIME, stats)
                        console.log('process close');
                        runner.kill();
                        //fs.unlinkSync(path.join(folder, filename));
                    })

                    // Monitor process
                    

            } else {
                let errorStr: string = `${compiler.stderr}`;
                errorStr = errorStr.replaceAll(path.join(folder, filename) + ":", "");
                client.emit(AppObject.SOCKET.RESPONSE.RESPONSE_RUNCODE, {isCompile: false,  output: null, error: errorStr, memory: 0, time: 0});
                //fs.unlinkSync(path.join(folder, filename));
            }
        }
    }
}