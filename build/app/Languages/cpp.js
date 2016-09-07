"use strict";
const interface_1 = require('./interface');
const compileCommand = "g++ -std=c++11 -O2 -s -static -o code code.cpp";
const libraryCommand = "g++ -std=c++11 -O2 -s -static -o code code.cpp grader.cpp";
const runCommand = "./code";
class CPP {
    constructor() {
        this.extName = ".cpp";
        this.hdrName = ".h";
        this.program = new interface_1.Commands(compileCommand, runCommand);
        this.library = new interface_1.Commands(libraryCommand, runCommand);
    }
}
exports.CPP = CPP;
//# sourceMappingURL=cpp.js.map