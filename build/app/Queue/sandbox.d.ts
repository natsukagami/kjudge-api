/// <reference path="../../../src/typings/index.d.ts" />
import * as Promise from 'bluebird';
import { CompletedProcess } from '../Process/process';
import { Verdict } from '../Submission/result';
import debug = require('debug');
export declare class ExecutionResult {
    verdict: Verdict;
    time: number;
    memory: number;
    process: CompletedProcess;
    constructor(verdict: Verdict, time: number, memory: number, process: CompletedProcess);
}
export interface SandboxInterface {
    folder: string;
    command: string;
    args: Array<string>;
    boxArgs?: Array<string>;
    prepare(): Promise<void>;
    run(): Promise<ExecutionResult>;
    cleanup(): Promise<void>;
}
export declare class IsolateSandbox implements SandboxInterface {
    folder: string;
    command: string;
    args: Array<string>;
    boxArgs: Array<string>;
    static Pool: number[];
    static Path: any;
    pool: number;
    boxFolder: string;
    private Debug;
    private process;
    constructor(folder: string, command: string, args?: Array<string>, boxArgs?: Array<string>);
    private getPool();
    static buildArgs(options: {
        time?: number;
        mem?: number;
        input?: string;
        output?: string;
    }): Array<string>;
    prepare(): Promise<void>;
    run(): Promise<ExecutionResult>;
    cleanup(): Promise<void>;
}
export declare class DirectBox implements SandboxInterface {
    folder: string;
    command: string;
    args: Array<string>;
    id: number;
    static Pool: number;
    Debug: debug.Debugger;
    constructor(folder: string, command: string, args?: Array<string>);
    prepare(): Promise<void>;
    run(): Promise<ExecutionResult>;
    cleanup(): Promise<void>;
}
