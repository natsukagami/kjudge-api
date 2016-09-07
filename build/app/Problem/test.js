"use strict";
class Test {
    constructor(id, inputFile, outputFile = null, timeLimit, memoryLimit, score, group = 0) {
        this.id = id;
        this.inputFile = inputFile;
        this.outputFile = outputFile;
        this.timeLimit = timeLimit;
        this.memoryLimit = memoryLimit;
        this.score = score;
        this.group = group;
    }
}
exports.Test = Test;
//# sourceMappingURL=test.js.map