import pc from 'child_process';
import fs  from 'fs';
import path from 'path';
import { Node, NodeFlags } from 'typescript';
import { AppObject } from '../../commons/app.object';

export async function executeFile(client: any, folder: any, filename: any, language: any, input: any, className?: string) {
    switch(language) {
        case 'cpp': {
            let errorStr = "";
            const compiledPath = path.join(folder,`${filename.split(".")[0]}.exe`);
            const args = ['-o', `${compiledPath}`, `${path.join(folder, filename)}`];
            const compiler = pc.spawn("g++", args, {timeout: 10000});
            compiler.unref();

            compiler.stderr.on(`data`, (data) => {
                errorStr += `${data}`;
                errorStr = errorStr.replaceAll(path.join(folder, filename) + ":", "");
            })

            compiler.on('close', (code) => {
                if(code === 0) {
                    let dataStr = "";
                    client.emit(AppObject.SOCKET.RESPONSE.RESPONSE_RUNCODE, {isCompile: true,  output: null, error: null});
                    const runner = pc.spawn(compiledPath, {timeout: 20000});
                    runner.unref();
                    const perf = require('execution-time')();
                    perf.start();

                    if(input.trim()) {
                        runner.stdin.write(input);
                        runner.stdin.end();
                    }

                    runner.stdout.on(`data`, async (data) => {
                        dataStr = dataStr.replaceAll(path.join(folder, filename) + ":", "");
                        dataStr += `${data}`;
                    });

                    runner.on('close', async (code, signal) => {
                        if(signal === `SIGTERM`) {
                            client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true, output: null, error: `Time limited execeeded`, time: '>4', memory: 0});
                        }
                        else if(code !== 0) {
                            client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true, output: null, error: `Runtime error`, time: 0, memory: 0});
                        } 
                        let executeTime = Math.floor(perf.stop().time/10);
                        client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true,  output: dataStr, error: null, time: executeTime / 100, memory: 0});
                        try {
                            fs.unlinkSync(path.join(folder, filename));
                            fs.unlinkSync(compiledPath);
                        } catch {}
                    })                    

                } else {
                    client.emit(AppObject.SOCKET.RESPONSE.RESPONSE_RUNCODE, {isCompile: false,  output: null, error: errorStr, memory: 0, time: 0});
                    try {
                    fs.unlinkSync(path.join(folder, filename));
                    } catch {}
                }
            });
            break;
        }
        case 'java': {
            const args = [`${path.join(folder, filename)}`];
            const compiler = pc.spawn("javac", args, {timeout: 10000});
            compiler.unref();
            let error = '';

            compiler.on('close', (code) => {
                    if(code == 0) {
                    let dataStr = "";
                    const runargs = [`${filename.replace(".java", "")}`];
                    client.emit(AppObject.SOCKET.RESPONSE.RESPONSE_RUNCODE, {isCompile: true,  output: null, error: null});
                    const runner = pc.spawn("java", runargs, {timeout: 20000, cwd: path.normalize(folder)});
                    runner.unref();

                    const perf = require('execution-time')();
                    perf.start();

                    if(input) {
                        runner.stdin.write(input);
                        runner.stdin.end();
                    }

                    runner.stdout.on(`data`, (data) => {
                        dataStr += `${data}`;
                        dataStr = dataStr.replaceAll(path.join(folder, filename) + ":", "");
                    });

                    runner.on('close', (code, signal) => {
                        if(code === 143 || signal === `SIGTERM`) {
                            client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true, output: null, error: `Time limited execeeded`, time: '4', memory: 0});
                        }
                        else if(code !== 0) {
                            client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true, output: null, error: `Runtime error`, time: 0, memory: 0});
                        } ;
                        const executeTime = Math.floor(perf.stop().time/10);
                        client.emit(AppObject.SOCKET.RESPONSE.OUTPUT_RUNCODE, {isCompile: true,  output: `${dataStr}`, error: null, time: executeTime/100, memory: 0});
                        try {
                            fs.unlinkSync(path.join(folder, filename));
                            fs.unlinkSync(path.join(folder, filename.replace(".java",".class")));
                        } catch (error) {
                            require('signale').error('Unlink error, please check');
                        }
                    })
                } else {
                    client.emit(AppObject.SOCKET.RESPONSE.RESPONSE_RUNCODE, {isCompile: false,  output: null, error: error, memory: 0, time: 0});
                    try {
                        fs.unlinkSync(path.join(folder, filename));
                    } catch {
                        console.log('unlink error');
                    }
                }
            })

            compiler.stderr.on('data', (data) =>  {
                let errorStr: string = `${data}`;
                errorStr = errorStr.replaceAll(path.join(folder, filename) + ":", "");
                error += errorStr;
            })

            break;
        }
    }
}

export async function compile(folder: any, filename: any, language: any): Promise<any> {
    switch(language) {
        case 'cpp': {
            return new Promise((resolve, reject) => {
                const compiledPath = path.join(folder, `${filename.split(".")[0]}.exe`);
                const args = ['-o', `${compiledPath}`, `${path.join(folder, filename)}`];
                const compiler =  pc.spawn("g++", args, {shell: true, windowsHide: true, timeout: 10000});
                
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
            return new Promise((resolve, reject) => {
                const args = ['-Xlint:unchecked', `${path.join(folder, filename)}`];
                const compiler = pc.spawn("javac", args, {timeout: 20000});
                let errorStr = "";
                compiler.unref();

                compiler.stderr.on('data', (data) => {
                    const dataError =  `${data}`;
                    errorStr += dataError.replaceAll(path.join(folder, filename) + ":", "");
                });

                compiler.on('close', (code) => {
                    if(code === 0) resolve({
                        status: null,
                        detail: null
                    })
                    resolve({
                        status: AppObject.SUBMISSION_STATUS.CE,
                        detail: errorStr
                    });
                })
            })
        }
    }
}

export async function submit(language: any, compiledPath: any,  input: any, filename?: any, folder?: any): Promise<any>{
    switch(language) {
        case 'cpp': {
            return new Promise((resolve, reject) => {
                    const runner = pc.spawn(compiledPath, {timeout: 20000});
                    let dataStr = "";
                    runner.unref();
                    const perf = require('execution-time')();
                    perf.start();

                    if(input) {
                        runner.stdin.write(input);
                        runner.stdin.end();
                    }

                    runner.stdout.on(`data`, (data) => {
                        dataStr += `${data}`;
                    });

                    runner.on('close', (code, signal) => {
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
                        const executeTime = Math.floor(perf.stop().time/10);
                        resolve({
                            output: dataStr,
                            status: null,
                            detail: null,
                            time: executeTime/100,
                            memory: 0
                        })
                    })                    
            })
        }
        case 'java': {
            return new Promise((resolve, reject) => {
            const runargs = [`${filename.replace(".java", "")}`];
            const runner = pc.spawn("java", runargs, {cwd: path.join(folder,'')});
            let dataStr = "";
            runner.unref();
            const perf = require('execution-time')();
            perf.start();

            if(input) {
                runner.stdin.write(input);
                runner.stdin.end();
            }

            runner.stdout.on(`data`, (data) => {
                dataStr += `${data}`;
            });

            runner.stderr.on("data", (data) => {
                console.log(`${data}`);
            })

            runner.on('close', (code, signal) => {
                if(code === 143) {
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
                const executeTime = Math.floor(perf.stop().time/10);
                resolve({
                    output: dataStr,
                    status: null,
                    detail: null,
                    time: executeTime/100,
                    memory: 0
                })
            })                    
            })
        }
    }
}