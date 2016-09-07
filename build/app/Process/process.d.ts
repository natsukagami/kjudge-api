/// <reference path="../../../src/typings/index.d.ts" />
import * as Promise from 'bluebird';
export declare class CompletedProcess {
    command: string;
    returnCode: number;
    stdout: string;
    stderr: string;
    constructor(command: string, returnCode: number, stdout: string, stderr: string);
}
export declare function runProcess(command: string, cwd?: string, timeout?: number): Promise<CompletedProcess>;
