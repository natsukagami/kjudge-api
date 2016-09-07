"use strict";
function checkScorerType(s) {
    return s === 'single' || s === 'subtaskMin' || s === 'subtaskMul';
}
exports.checkScorerType = checkScorerType;
class SingleScorer {
    score(testSuite, testResults) {
        let totalScore = 0;
        if (testSuite.length !== testResults.length) {
            throw new Error('Number of tests and results do not match');
        }
        for (let i = 0; i < testSuite.length; ++i) {
            totalScore += testResults[i].ratio * testSuite[i].score;
        }
        return [totalScore, [totalScore]];
    }
}
class SubtaskMinScorer {
    score(testSuite, testResults) {
        let totalScore = 0;
        let subtaskScores = [], subtaskResults = [];
        if (testSuite.length !== testResults.length) {
            throw new Error('Number of tests and results do not match');
        }
        for (let i = 0; i < testSuite.length; ++i) {
            let test = testSuite[i], res = testResults[i];
            while (subtaskScores.length <= test.group) {
                subtaskResults.push(1);
                subtaskScores.push(0);
            }
            subtaskScores[test.group] += test.score;
            subtaskResults[test.group] = Math.min(subtaskResults[test.group], res.ratio);
        }
        let arr = [];
        for (let i = 0; i < subtaskResults.length; ++i) {
            totalScore += subtaskResults[i] * subtaskScores[i];
            arr.push(subtaskResults[i] * subtaskScores[i]);
        }
        return [totalScore, arr];
    }
}
class SubtaskMulScorer {
    score(testSuite, testResults) {
        let totalScore = 0;
        let subtaskScores = [], subtaskResults = [];
        if (testSuite.length !== testResults.length) {
            throw new Error('Number of tests and results do not match');
        }
        for (let i = 0; i < testSuite.length; ++i) {
            let test = testSuite[i], res = testResults[i];
            while (subtaskScores.length <= test.group) {
                subtaskResults.push(1);
                subtaskScores.push(0);
            }
            subtaskScores[test.group] += test.score;
            subtaskResults[test.group] *= res.ratio;
        }
        let arr = [];
        for (let i = 0; i < subtaskResults.length; ++i) {
            totalScore += subtaskResults[i] * subtaskScores[i];
            arr.push(subtaskResults[i] * subtaskScores[i]);
        }
        return [totalScore, arr];
    }
}
function getScorer(type) {
    if (type === 'single')
        return new SingleScorer();
    if (type === 'subtaskMin')
        return new SubtaskMinScorer();
    if (type === 'subtaskMul')
        return new SubtaskMulScorer();
}
exports.getScorer = getScorer;
//# sourceMappingURL=scorer.js.map