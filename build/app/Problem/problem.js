"use strict";
const scorer_1 = require('../Scorer/scorer');
const path = require('path');
class Problem {
    constructor(name, submitType, scorerType, compare = "", header = "", grader = "") {
        this.name = name;
        this.submitType = submitType;
        this.scorerType = scorerType;
        this.compare = compare;
        this.header = header;
        this.grader = grader;
        this.tests = [];
        this.scorer = scorer_1.getScorer(this.scorerType);
        this.folder = path.join(Problem.Path, this.name);
    }
    pushTest(test) {
        test.inputFile = path.join(this.folder, test.inputFile);
        if (test.outputFile)
            test.outputFile = path.join(this.folder, test.outputFile);
        this.tests.push(test);
    }
}
exports.Problem = Problem;
//# sourceMappingURL=problem.js.map