"use strict";
const submission_1 = require('./Submission/submission');
const problem_1 = require('./Problem/problem');
const test_1 = require('./Problem/test');
const queue_1 = require('./Queue/queue');
const sandbox_1 = require('./Queue/sandbox');
module.exports = ({ queueConcurrency = 4, isolatePath = '/var/lib/isolate/', problemsPath = './problems' }) => {
    queue_1.cQueue.concurrency = queueConcurrency;
    sandbox_1.IsolateSandbox.Path = isolatePath;
    problem_1.Problem.Path = problemsPath;
    return {
        Submission: submission_1.Submission,
        Problem: problem_1.Problem,
        Test: test_1.Test,
        Queue: queue_1.Queue
    };
};
//# sourceMappingURL=index.js.map