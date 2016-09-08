/// <reference path="../../../src/typings/index.d.ts" />
import Promise = require('bluebird');
export declare class FSQueue {
    queue: Array<[Function, string]>;
    private current;
    static concurrency: number;
    makePromise(f: Function): Promise<any>;
    constructor();
    runQueue(): void;
    push(f: Function): Promise<any>;
}
export declare function copyAsync(source: string, dest: string): Promise<void>;
export declare function walkAsync(dir: string, prefix?: string): Promise<Array<string>>;
export declare function readFileAsync(path: string): Promise<string>;
export declare function mkdirTempAsync(prefix: string): Promise<string>;
