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
    private makePromise(j, priority);
    private runJobs();
    push(j: JobInterface, priority?: number): Promise<ExecutionResult>;
}
export declare const Queue: cQueue;
