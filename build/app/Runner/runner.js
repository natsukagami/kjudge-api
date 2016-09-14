"use strict";
const result_1 = require('../Submission/result');
const misc_1 = require('../Misc/misc');
const Promise = require('bluebird');
const Job = require('../Queue/job');
const queue_1 = require('../Queue/queue');
const shellEscape = require('shell-escape');
const path = require('path');
const fs = require('fs-extra');
function enqueueProcess(name, command, cwd = "", priority = 0) {
    let s = new Job.DirectBox(cwd, command);
    let j = new Job.Job(name, s);
    return queue_1.Queue.push(j, priority).then((res) => { return res.process; });
}
class Runner {
    constructor(submission, test) {
        this.submission = submission;
        this.test = test;
        this.problem = this.submission.problem;
    }
    score_by_diff(output, answer) {
        return enqueueProcess('Scoring test ' + this.test.id.toString() + ' for submission #' + this.submission.id.toString(), shellEscape(['diff', '-w', '-q', output, answer]) + ' >/dev/null 2>/dev/null', '', 20).then((proc) => {
            return (proc.returnCode === 0 ? 1 : 0);
        });
    }
    score_by_compare(input, output, answer, dir) {
        return enqueueProcess('Scoring test ' + this.test.id.toString() + ' for submission #' + this.submission.id.toString(), shellEscape(['./compare', input, output, answer]), dir, 20).then((proc) => {
            let x = Number(proc.stdout.replace(/\n/g, '').replace(/\r/g, ''));
            let y = [x, proc.stderr.replace(/\n/g, '').replace(/\r/g, '')];
            return y;
        });
    }
    judge() {
        let tempFolder = '';
        let promise = Promise.all([
            misc_1.mkdirTempAsync('runner-'),
            this.submission.folder
        ]).then((dirs) => {
            tempFolder = dirs[0];
            let arr = [];
            arr.push(misc_1.copyAsync(this.test.inputFile, path.join(tempFolder, 'input.txt')));
            if (this.problem.submitType === 'single')
                arr.push(misc_1.copyAsync(path.join(dirs[1], 'code'), path.join(tempFolder, 'code')));
            else
                arr.push(misc_1.copyAsync(path.join(dirs[1], 'grader'), path.join(tempFolder, 'code')));
            if (this.problem.compare !== '')
                arr.push(misc_1.copyAsync(path.join(dirs[1], 'compare'), path.join(tempFolder, 'compare')));
            return Promise.all(arr);
        }).then(() => {
            let s = new Job.IsolateSandbox(tempFolder, './code', [], Job.IsolateSandbox.buildArgs({
                time: this.test.timeLimit,
                mem: this.test.memoryLimit,
                input: 'input.txt',
                output: 'output.txt'
            }));
            let j = new Job.Job('Running test ' + this.test.id.toString() + ' on Submission #' + this.submission.id.toString(), s);
            return queue_1.Queue.push(j);
        }).then((exec) => {
            if (exec.verdict !== result_1.Verdict.Accepted) {
                return new result_1.Result(this.test.id, exec.time, exec.memory, exec.verdict, 0);
            }
            if (this.problem.compare === "")
                return this.score_by_diff(path.join(tempFolder, 'output.txt'), this.test.outputFile).then((correct) => {
                    return new result_1.Result(this.test.id, exec.time, exec.memory, (correct ? result_1.Verdict.Accepted : result_1.Verdict.WrongAnswer), correct);
                });
            return this.score_by_compare(this.test.inputFile, path.join(tempFolder, 'output.txt'), this.test.outputFile, tempFolder).then((returns) => {
                let correct = returns[0];
                let v = result_1.Verdict.WrongAnswer;
                if (correct == 1)
                    v = result_1.Verdict.Accepted;
                else if (correct > 0)
                    v = result_1.Verdict.PartiallyCorrect;
                return new result_1.Result(this.test.id, exec.time, exec.memory, v, correct, returns[1]);
            });
        });
        promise.finally(() => {
            fs.remove(tempFolder);
        });
        return promise;
    }
}
exports.Runner = Runner;
//# sourceMappingURL=runner.js.map