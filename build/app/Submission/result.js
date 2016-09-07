"use strict";
(function (Verdict) {
    Verdict[Verdict["Accepted"] = 0] = "Accepted";
    Verdict[Verdict["PartiallyCorrect"] = 1] = "PartiallyCorrect";
    Verdict[Verdict["WrongAnswer"] = 2] = "WrongAnswer";
    Verdict[Verdict["TimeLimitExceeded"] = 3] = "TimeLimitExceeded";
    Verdict[Verdict["RuntimeError"] = 4] = "RuntimeError";
    Verdict[Verdict["MemoryLimitExceeded"] = 5] = "MemoryLimitExceeded";
    Verdict[Verdict["CompileError"] = 6] = "CompileError";
})(exports.Verdict || (exports.Verdict = {}));
var Verdict = exports.Verdict;
function getVerdictDisplay(v) {
    switch (v) {
        case Verdict.Accepted:
            return ["Accepted", "AC"];
        case Verdict.PartiallyCorrect:
            return ["Partially Correct", "SS"];
        case Verdict.WrongAnswer:
            return ["Wrong Answer", "WA"];
        case Verdict.TimeLimitExceeded:
            return ["Time Limit Exceeded", "TLE"];
        case Verdict.RuntimeError:
            return ["Runtime Error", "RTE"];
        case Verdict.MemoryLimitExceeded:
            return ["Memory Limit Exceeded", "MLE"];
        case Verdict.CompileError:
            return ["Compile Error", "CE"];
        default:
            throw new Error('Verdict out of range!');
    }
}
exports.getVerdictDisplay = getVerdictDisplay;
class Result {
    constructor(testId, runningTime, memoryUsed, verdict, ratio, message = "") {
        this.testId = testId;
        this.runningTime = runningTime;
        this.memoryUsed = memoryUsed;
        this.verdict = verdict;
        this.ratio = ratio;
        this.message = message;
    }
}
exports.Result = Result;
//# sourceMappingURL=result.js.map