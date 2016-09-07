"use strict";
const Promise = require('bluebird');
const path = require('path');
const misc_1 = require('../Misc/misc');
const process_1 = require('../Process/process');
const result_1 = require('../Submission/result');
const debug = require('debug');
class ExecutionResult {
    constructor(verdict, time, memory, process) {
        this.verdict = verdict;
        this.time = time;
        this.memory = memory;
        this.process = process;
    }
}
exports.ExecutionResult = ExecutionResult;
class IsolateSandbox {
    constructor(folder, command, args = [], boxArgs = []) {
        this.folder = folder;
        this.command = command;
        this.args = args;
        this.boxArgs = boxArgs;
        this.pool = -1;
    }
    getPool() {
        if (this.pool !== -1)
            return Promise.resolve(this.pool);
        return new Promise((resolve, reject) => {
            if (IsolateSandbox.Pool.length > 0) {
                this.pool = IsolateSandbox.Pool.shift();
                this.Debug = debug('kjudge:sandbox:IsolateSandbox#' + this.pool.toString());
                resolve(this.pool);
            }
            resolve(Promise.delay(500).then(() => {
                return this.getPool();
            }));
        });
    }
    static buildArgs(options) {
        let res = [];
        if (options.time)
            res.push('-t', (options.time / 1000).toString(), '-w', (options.time / 1000 * 2).toString());
        if (options.mem)
            res.push('-m', options.mem.toString());
        if (options.input)
            res.push('-i', options.input);
        if (options.output)
            res.push('-o', options.output);
        return res;
    }
    prepare() {
        return this.getPool().then(() => {
            this.Debug('Starting prepare...');
            return process_1.runProcess('isolate --init --cg -b ' + this.pool.toString());
        }).then((proc) => {
            if (proc.returnCode > 0)
                return Promise.reject(new Error('isolate failed to init: Maybe it\'s not installed?'));
            this.boxFolder = path.join(IsolateSandbox.Path, this.pool.toString(), 'box');
        }).then(() => {
            return misc_1.walkAsync(this.folder).then((files) => {
                return Promise.map(files, (file) => {
                    file = path.relative(this.folder, file);
                    return misc_1.copyAsync(path.join(this.folder, file), path.join(this.boxFolder, file));
                });
            });
        }).then(() => {
            this.Debug('Preparation completed');
        });
    }
    run() {
        let command = `isolate --run --cg -b ${this.pool} -M ${path.join(this.boxFolder, 'meta.txt')} ${this.boxArgs.join(' ')} ${this.command} ${this.args.join(' ')}`;
        this.Debug('Sandbox started');
        return process_1.runProcess(command).then((proc) => {
            this.process = proc;
            return misc_1.readFileAsync(path.join(this.boxFolder, 'meta.txt'));
        }).then((content) => {
            let opt = {};
            content.split('\n').forEach(function (line) {
                let [name, val] = line.split(':');
                opt[name] = val;
            });
            return opt;
        }).then((opt) => {
            let verdict;
            switch (opt.status) {
                case 'RE':
                    verdict = result_1.Verdict.RuntimeError;
                case 'SG':
                    verdict = result_1.Verdict.RuntimeError;
                case 'TLE':
                    verdict = result_1.Verdict.TimeLimitExceeded;
                case 'MLE':
                    verdict = result_1.Verdict.MemoryLimitExceeded;
                default:
                    verdict = result_1.Verdict.Accepted;
            }
            let res = new ExecutionResult(verdict, Number(opt.time) * 1000, Number(opt['cg-mem']), this.process);
            return res;
        }).then((res) => {
            if (res.verdict === result_1.Verdict.Accepted) {
                return misc_1.copyAsync(path.join(this.boxFolder, 'output.txt'), path.join(this.folder, 'output.txt')).then(() => {
                }).then(() => {
                    this.Debug('Sandbox ended: ' + JSON.stringify(res));
                    return res;
                });
            }
            return res;
        });
    }
    cleanup() {
        this.Debug('Cleaning up...');
        return process_1.runProcess(`isolate --cleanup -b ${this.pool}`).then(() => {
            IsolateSandbox.Pool.push(this.pool);
        });
    }
}
IsolateSandbox.Pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
exports.IsolateSandbox = IsolateSandbox;
class DirectBox {
    constructor(folder, command, args = []) {
        this.folder = folder;
        this.command = command;
        this.args = args;
        this.id = ++DirectBox.Pool;
        this.Debug = debug('kjudge:sandbox:DirectBox#' + this.id.toString());
    }
    prepare() {
        return Promise.resolve();
    }
    run() {
        this.Debug('Starting task...');
        let time = new Date();
        return process_1.runProcess(`${this.command} ${this.args.join(' ')}`, this.folder, 10000)
            .then((res) => {
            let nwTime = new Date();
            this.Debug('Task done');
            return new ExecutionResult((res.returnCode === 0 ? result_1.Verdict.Accepted : result_1.Verdict.WrongAnswer), Math.min(10000, nwTime.getTime() - time.getTime()), 0, res);
        });
    }
    cleanup() {
        return Promise.resolve();
    }
}
DirectBox.Pool = 0;
exports.DirectBox = DirectBox;
//# sourceMappingURL=sandbox.js.map