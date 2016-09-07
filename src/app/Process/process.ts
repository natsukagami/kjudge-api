/// <reference path="../../typings/index.d.ts" />
import * as childProcess from 'child_process'
import * as Promise from 'bluebird'
import debug = require('debug');

const Debug = debug('kjudge:process');

export class CompletedProcess {
	constructor(public command: string, public returnCode: number, public stdout: string, public stderr: string) {

	}
}

export function runProcess(command: string, cwd: string = '', timeout: number = 0): Promise<CompletedProcess> {
	Debug('Running `' + command + (cwd === '' ? '' : '` @ `' + cwd) + '`...');
	return new Promise<CompletedProcess>((resolve, reject) => {
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
