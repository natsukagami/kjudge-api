/// <reference path="../../../src/typings/index.d.ts" />
import Promise = require('bluebird');
import debug = require('debug');
import Sandbox = require('./sandbox');
export { IsolateSandbox, DirectBox, ExecutionResult } from './sandbox';
export interface JobInterface {
    id: string;
    sandbox: Sandbox.SandboxInterface;
    name: string;
    start(): Promise<Sandbox.ExecutionResult>;
}
export declare class Job implements JobInterface {
    name: string;
    sandbox: Sandbox.SandboxInterface;
    id: string;
    Debug: debug.Debugger;
    constructor(name: string, sandbox: Sandbox.SandboxInterface);
    start(): Promise<Sandbox.ExecutionResult>;
}
