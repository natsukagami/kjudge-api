/// <reference path="../../../typings/globals/node/index.d.ts" />
/// <reference path="../../../typings/modules/bluebird/index.d.ts" />
import * as childProcess from 'child_process'
import * as Promise from 'bluebird'

export class CompletedProcess {
	constructor(public command: string, public returnCode: number, public stdout: string, public stderr: string) {

	}
} 

export function runProcess(command: string, cwd: string = ""): Promise<CompletedProcess> {
	console.log('Running `' + command + '`...');
	return new Promise<CompletedProcess>((resolve, reject) => {
		childProcess.exec(command, {
			cwd: cwd
		}, (err, stdout, stderr) => {
			if (err)
				resolve(new CompletedProcess(command, 1, stdout, stderr));
			resolve(new CompletedProcess(command, 0, stdout, stderr));
		});
	});
}