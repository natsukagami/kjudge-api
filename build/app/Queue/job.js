"use strict";
const Promise = require('bluebird');
const debug = require('debug');
const uuid = require('uuid');
var sandbox_1 = require('./sandbox');
exports.IsolateSandbox = sandbox_1.IsolateSandbox;
exports.DirectBox = sandbox_1.DirectBox;
exports.ExecutionResult = sandbox_1.ExecutionResult;
class Job {
    constructor(name, sandbox) {
        this.name = name;
        this.sandbox = sandbox;
        this.id = uuid.v4();
        this.Debug = debug('kjudge:job:' + this.id);
    }
    start() {
        this.Debug(this.name + ': Job started');
        return Promise.resolve()
            .then(() => {
            return this.sandbox.prepare();
        })
            .then(() => {
            return this.sandbox.run();
        })
            .then((res) => {
            this.Debug(this.name + ': Job ended');
            this.sandbox.cleanup();
            return res;
        });
    }
}
exports.Job = Job;
//# sourceMappingURL=job.js.map