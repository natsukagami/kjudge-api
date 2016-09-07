/// <reference path="../../../src/typings/index.d.ts" />
import Promise = require('bluebird');
export declare function copyAsync(source: string, dest: string): Promise<void>;
export declare function walkAsync(dir: string): Promise<Array<string>>;
export declare function readFileAsync(path: string): Promise<string>;
export declare function mkdirTempAsync(prefix: string): Promise<string>;
