"use strict";
const childProcess = require('child_process');
const Promise = require('bluebird');
const debug = require('debug');
const Debug = debug('kjudge:process');
class CompletedProcess {
    constructor(command, returnCode, stdout, stderr) {
        this.command = command;
        this.returnCode = returnCode;
        this.stdout = stdout;
        this.stderr = stderr;
    }
}
exports.CompletedProcess = CompletedProcess;
function runProcess(command, cwd = '', timeout = 0) {
    Debug('Running `' + command + (cwd === '' ? '' : '` @ `' + cwd) + '`...');
    return new Promise((resolve, reject) => {
        childProcess.exec(command, {
            cwd: cwd,
            timeout: timeout
        }, (err, stdout, stderr) => {
            Debug('Command `' + command + '` done ' + (err ? 'with errors' : 'with no errors.'));
            if (err)
                resolve(new CompletedProcess(command, 1, stdout, stderr));
            resolve(new CompletedProcess(command, 0, stdout, stderr));
        });
    });
}
exports.runProcess = runProcess;
//# sourceMappingURL=process.js.map