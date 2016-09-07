"use strict";
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const Job = require('../Queue/job');
const Queue = require('../Queue/queue');
function checkSubmitType(s) {
    return s === 'single' || s === 'library' || s === 'outputOnly';
}
exports.checkSubmitType = checkSubmitType;
function compileJob(compiler, command, folder) {
    let s = new Job.DirectBox(folder, command);
    let j = new Job.Job('Compiling file for submission #' + compiler.submission.id, s);
    return Queue.Queue.push(j);
}
class SingleCompiler {
    constructor(submission, language) {
        this.submission = submission;
        this.language = language;
    }
    compile(folder, code, compare = "") {
        return folder.then((dir) => {
            return Promise.all([
                writeFileAsync(path.join(dir, 'code' + this.language.extName), code),
                (compare === "" ? Promise.resolve(null) : writeFileAsync(path.join(dir, 'compare' + this.language.extName), compare))
            ])
                .then(() => {
                let arr = [
                    compileJob(this, this.language.program.compile, dir)
                ];
                if (compare !== "") {
                    arr.push(compileJob(this, this.language.program.compile.replace(/code/g, 'compare'), dir));
                }
                return Promise.all(arr);
            }).then((procs) => {
                procs.forEach((proc) => {
                    if (proc.process.returnCode !== 0)
                        return Promise.reject(new Error('Compile Error: ' + proc.process.stderr));
                });
                return dir;
            });
        });
    }
}
class LibraryCompiler {
    constructor(submission, language) {
        this.submission = submission;
        this.language = language;
    }
    compile(folder, code, compare = "", header, grader) {
        return folder.then((dir) => {
            return Promise.all([
                writeFileAsync(path.join(dir, 'grader' + this.language.hdrName), header),
                writeFileAsync(path.join(dir, 'code' + this.language.extName), code),
                writeFileAsync(path.join(dir, 'grader' + this.language.extName), grader),
                (compare === "" ? Promise.resolve(null) : writeFileAsync(path.join(dir, 'compare' + this.language.extName), compare))
            ]).then(() => {
                let arr = [
                    compileJob(this, this.language.library.compile, dir)
                ];
                if (compare !== "") {
                    arr.push(compileJob(this, this.language.program.compile.replace(/code/g, 'compare'), dir));
                }
                return Promise.all(arr);
            }).then((procs) => {
                procs.forEach((proc) => {
                    if (proc.process.returnCode !== 0)
                        return Promise.reject(new Error('Compile Error: ' + proc.process.stderr));
                });
                return dir;
            });
        });
    }
}
function getCompiler(s) {
    if (s.problem.submitType === 'single')
        return new SingleCompiler(s, s.language);
    if (s.problem.submitType === 'library')
        return new LibraryCompiler(s, s.language);
}
exports.getCompiler = getCompiler;
function writeFileAsync(path, content) {
    return new Promise((resolve, reject) => {
        let file = fs.createWriteStream(path);
        file.on('open', () => { resolve(file); });
    }).then((file) => {
        return new Promise((resolve, reject) => {
            file.end(content, 'utf8', () => { resolve(); });
        });
    });
}
//# sourceMappingURL=compiler.js.map