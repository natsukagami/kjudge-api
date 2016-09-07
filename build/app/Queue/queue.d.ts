/// <reference path="../../../src/typings/index.d.ts" />
import Promise = require('bluebird');
import { JobInterface } from './job';
import { ExecutionResult } from './sandbox';
import Events = require('events');
export declare class cQueue {
    private queue;
    private current;
    Dispatcher: Events.EventEmitter;
    private Debug;
    static concurrency: number;
    constructor();
    private makePromise(j);
    private runJobs();
    push(j: JobInterface): Promise<ExecutionResult>;
}
export declare const Queue: cQueue;
