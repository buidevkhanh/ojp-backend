import pc from 'child_process';
import fs  from 'fs';
import path from 'path';
import { AppObject } from '../../commons/app.object';

export async function executeFile(client: any, folder: any, filename: any, language: any, input: any, className?: string) {
    switch(language) {
        case 'cpp': {
            const compiledPath = path.join(folder,`${filename.split(".")[0]}.exe`);
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
                    const runner = pc.spawn(compiledPath, {shell: true, windowsHide: true, timeout: 20000});
                    if(input.trim()) {
                        runner.stdin.write(input);
                        runner.stdin.end();
                    }

                    runner.stdout.on(`data`, async (data) => {
                        let dataStr: string = `${data}`;
                        dataStr = dataStr.replaceAll(path.join(folder, filename) + ":", "");
                        const index = dataStr.lastIndexOf("\n");
                        let executeTime = dataStr.substring(index+1);
                        while(executeTime.lastIndexOf("0") === executeTime.length - 1) {
                            executeTime = executeTime.substring(0, executeTime.length - 1);
                        }
                        dataStr = dataStr.substring(0,index);
                        client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true,  output: dataStr, error: null, time: executeTime, memory: 0});
                    });

                    runner.on('close', async (code, signal) => {
                        if(signal === `SIGTERM`) {
                            client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true, output: null, error: `Time limited execeeded`, time: '>4', memory: 0});
                        }
                        else if(code !== 0) {
                            client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true, output: null, error: `Runtime error`, time: 0, memory: 0});
                        } 
                        try {
                            fs.unlinkSync(path.join(folder, filename));
                            fs.unlinkSync(compiledPath);
                        } catch {}
                    })                    

                } else {
                    try {
                    fs.unlinkSync(path.join(folder, filename));
                    fs.unlinkSync(compiledPath);
                    } catch {}
                }
            });
            break;
        }
        case 'java': {
            const args = [`${path.join(folder, filename)}`];
            const compiler = await pc.spawn("javac", args);
        
            compiler.on('close', (code) => {
                    if(code == 0) {
                    const runargs = [`${filename.replace(".java", "")}`];
                    client.emit(AppObject.SOCKET.RESPONSE.RESPONSE_RUNCODE, {isCompile: true,  output: null, error: null});
                    const runner = pc.spawn("java", runargs, {shell: true, detached: true, timeout: 20000, cwd: path.normalize(folder)});
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
                        dataStr = dataStr.replaceAll(path.join(folder, filename) + ":", "");
                        client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true,  output: executeTime <= 2000 ? `${dataStr}` : null, error:executeTime <= 2000? null : `Time limited execeeded`, time: executeTime, memory: 0});
                    });

                    runner.on('close', (code, signal) => {
                        //client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE_TIME, stats)
                        if(code === 143) {
                            client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true, output: null, error: `Time limited execeeded`, time: '>4', memory: 0});
                        }
                        else if(code !== 0) {
                            client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true, output: null, error: `Runtime error`, time: 0, memory: 0});
                        } ;
                        try {
                            fs.unlinkSync(path.join(folder, filename));
                            fs.unlinkSync(path.join(folder, filename.replace(".java",".class")));
                        } catch (error) {
                            require('signale').error('Unlink error, please check');
                        }
                    })
                }  
            })

            compiler.stderr.on('data', (data) =>  {
                let errorStr: string = `${data}`;
                errorStr = errorStr.replaceAll(path.join(folder, filename) + ":", "");
                client.emit(AppObject.SOCKET.RESPONSE.RESPONSE_RUNCODE, {isCompile: false,  output: null, error: errorStr, memory: 0, time: 0});
                try {
                    fs.unlinkSync(path.join(folder, filename));
                } catch (error) {
                }
            })
        }
    }
}

export async function compile(folder: any, filename: any, language: any): Promise<any> {
    switch(language) {
        case 'cpp': {
            return new Promise((resolve, reject) => {
                const compiledPath = path.join(folder, `${filename.split(".")[0]}.exe`);
                const args = ['-o', `${compiledPath}`, `${path.join(folder, filename)}`];
                const compiler =  pc.spawn("g++", args, {shell: true, windowsHide: true});
                
                compiler.stderr.on('data', (data) => {
                    let errorStr: string = `${data}`;
                    errorStr = errorStr.replaceAll(path.join(folder, filename) + ":", "");
                    resolve({
                        status: AppObject.SUBMISSION_STATUS.CE,
                        detail: errorStr
                    });
                });

                compiler.on('close', code => {
                    if(code == 0) {
                        resolve(
                            {
                                status: null,
                                detail: compiledPath
                            }
                        )
                    }
                })
            })
        }
        case 'java': {
            const args = [`${path.join(folder, filename)}`];
            const compiler = await pc.spawnSync("javac", args);
            if(`${compiler.stderr}`) {
                let errorStr: string = `${compiler.stderr}`;
                errorStr = errorStr.replaceAll(path.join(folder, filename) + ":", "");
                return {
                    status: AppObject.SUBMISSION_STATUS.CE,
                    detail: errorStr
                }
            }
            return {
                status: null,
                detail: args[0]
            }
        }
    }
}

export async function submit(language: any, compiledPath: any,  input: any, filename?: any, folder?: any): Promise<any>{
    switch(language) {
        case 'cpp': {
            return new Promise((resolve, reject) => {
                    const runner = pc.spawn(compiledPath, {detached: true, timeout: 20000});
                    runner.unref();

                    if(input) {
                        runner.stdin.write(input);
                        runner.stdin.end();
                    }

                    runner.stdout.on(`data`, async (data) => {
                        let dataStr: string = `${data}`;
                        dataStr = dataStr.replaceAll(path.join(folder, filename) + ":", "");
                        const index = dataStr.lastIndexOf("\n");
                        let executeTime = dataStr.substring(index+1);
                        while(executeTime.lastIndexOf("0") === executeTime.length - 1) {
                            executeTime = executeTime.substring(0, executeTime.length - 1);
                        }
                        dataStr = dataStr.substring(0,index);
                        resolve({
                            output: dataStr,
                            status: null,
                            detail: null,
                            time: executeTime,
                            memory: 0
                        })
                    });

                    runner.on('close', async (code, signal) => {
                        if(signal === `SIGTERM`) {
                            resolve({
                                output: null,
                                status: AppObject.SUBMISSION_STATUS.TLE,
                                detail: null,
                                time: 4,
                                memory: 0
                            })
                        }
                        else if(code !== 0) {
                            resolve({
                                output: null,
                                status: AppObject.SUBMISSION_STATUS.RTE,
                                detail: null,
                                time: 0,
                                memory: 0
                            })
                        } 
                    })                    
            })
        }
        case 'java': {
            const runargs = [`${filename.replace(".java", "")}`];
            const runner = await pc.spawnSync("java", runargs, {input, timeout: 20000, cwd: path.normalize(folder)});
            if(runner.status === 143) {
                return {
                    output: null,
                    status: AppObject.SUBMISSION_STATUS.TLE,
                    detail: {
                        error: 'Time Limited Execeeded',
                        step: 'run'
                    },
                    time: 0,
                    memory: 0
                }
            } else if (runner.status !== 0) {
                return {
                    output: null,
                    status: AppObject.SUBMISSION_STATUS.RTE,
                    detail: {
                        error: 'Runtime error',
                        step: 'run'
                    },
                    time: 0,
                    memory: 0
                }
            } else {
                return {
                    output: `${runner.stdout}`,
                    status: null,
                    detail: null,
                    time: 0,
                    memory: 0
                }
            }
        }
        default: {
            return {
                output: null,
                status: AppObject.SUBMISSION_STATUS.RTE,
                detail: {
                    error: 'Time Limited Execeeded',
                    step: 'run'
                },
                time: 0,
                memory: 0
            }
        }
    }
}