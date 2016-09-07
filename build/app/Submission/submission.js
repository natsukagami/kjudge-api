"use strict";
const languages_1 = require('../Languages/languages');
const compiler_1 = require('../Compiler/compiler');
const runner_1 = require('../Runner/runner');
const temp = require('temp');
const Promise = require('bluebird');
temp.track();
function mkdirAsync(affixes = "") {
    return new Promise((resolve, reject) => {
        temp.mkdir(affixes, (err, dir) => {
            if (err)
                reject(err);
            resolve(dir);
        });
    });
}
class Submission {
    constructor(id, problem, language, code) {
        this.id = id;
        this.problem = problem;
        this.code = code;
        this.result = [];
        this.score = [-1, []];
        this.language = languages_1.getLanguage(language);
        this.folder = mkdirAsync('submission-');
        this.compiler = compiler_1.getCompiler(this);
    }
    judge() {
        let ret = this.compiler.compile(this.folder, this.code, this.problem.compare, this.problem.header, this.problem.grader).then((file) => {
            return Promise.map(this.problem.tests, (item) => {
                let runner = new runner_1.Runner(this, item);
                return runner.judge();
            });
        })
            .then((results) => {
            this.result = results;
            this.score = this.problem.scorer.score(this.problem.tests, results);
        })
            .catch((err) => {
            this.result = [];
            this.score = [-1, []];
        });
        ret.finally(() => {
            temp.cleanup();
        });
        return ret;
    }
}
exports.Submission = Submission;
//# sourceMappingURL=submission.js.map