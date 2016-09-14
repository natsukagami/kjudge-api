"use strict";
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs-extra');
chai.use(chaiAsPromised);
const assert = chai.assert;
const Kjudge = require('../app/index');
const kjudge = Kjudge({
    problemsPath: '/home/natsukagami/Projects/ttjudge-discord/problems',
    queueConcurrency: 7
});
describe('Overall Test', function () {
    this.timeout(60000);
    it('Should return a 100 score on this', function () {
        let pp = JSON.parse(fs.readFileSync('/home/natsukagami/Projects/ttjudge-discord/problems/blacknode/parse.json', 'utf-8')).problem;
        let problem = new kjudge.Problem(pp.name, pp.submitType, pp.scorerType);
        pp.tests.forEach((item) => {
            problem.pushTest(new kjudge.Test(item.id, item.inputFile, item.outputFile, item.timeLimit, item.memoryLimit, item.score, item.group));
        });
        let sub = new kjudge.Submission(1, problem, 'C++', fs.readFileSync('/home/natsukagami/Projects/ttjudge-discord/problems/blacknode/tree.cpp', 'utf-8'));
        return sub.judge().then(() => {
            console.log(sub.result);
            assert.deepEqual(sub.score[0], 100);
        });
    });
});
//# sourceMappingURL=test.js.map