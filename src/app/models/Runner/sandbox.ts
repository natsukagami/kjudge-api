/// <reference path="../../../typings/index.d.ts" />
import * as Promise from 'bluebird'
import * as path from 'path'
import * as fs from 'fs-extra'
import { runProcess } from '../Process/process'
import { Verdict } from '../Submission/result'


export class ExecutionResult {
	constructor(public verdict: Verdict, public time: number, public memory: number, public outputFile: string) { 

	}
}

export interface SandboxInterface {
	folder: string;
	inputFile: string;
	/**
	 * A prepare function that will be called before the execution
	 */
	prepare(): Promise<void>;
	/**
	 * Runs the program with the intended time and memory limit 
	 */
	run(timeLimit: number, memLimit: number): Promise<ExecutionResult>;
	/**
	 * A function that will be run after the execution. 
	 */
	cleanup(): Promise<void>;
}

class IsolateSandbox implements SandboxInterface {
	static Pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	static Path = '/var/lib/isolate'
	pool: number = -1;
	boxFolder: string;
	constructor(public folder: string, public inputFile: string) {

	}
	/**
	 * Gets the box number from the pool 
	 */
	getPool(): Promise<number> {
		if (this.pool !== -1) return Promise.resolve(this.pool);
		return new Promise<number>((resolve, reject) => {
			console.log(IsolateSandbox.Pool.length);
			if (IsolateSandbox.Pool.length > 0) {
				resolve(this.pool = IsolateSandbox.Pool.shift());
			}
			resolve(Promise.delay(500).then(() => {
				return this.getPool();
			}));
		});
	}
	prepare(): Promise<void> {
		return this.getPool().then(() => {
			console.log(`Pool = ${this.pool}`)
			/* Init the sandbox */
			return runProcess('isolate --init --cg -b ' + this.pool.toString());
		}).then((proc) => {
			if (proc.returnCode > 0) return Promise.reject(new Error('isolate failed to init: Maybe it\'s not installed?'));
			this.boxFolder = path.join(IsolateSandbox.Path, this.pool.toString(), 'box');
		}).then(() => {
			return Promise.all([
				copyAsync(path.join(this.folder, 'code'), path.join(this.boxFolder, 'code')),
				copyAsync(this.inputFile, path.join(this.boxFolder, 'input.txt'))
			]).then(() => { });
		});
	}
	run(time: number, mem: number): Promise<ExecutionResult> {
		let command: string = `isolate --run --cg -b ${this.pool} -M ${path.join(this.folder, 'meta.txt')} -t ${time / 1000} -w ${time * 2 / 1000} -x 1 -k 262144 -m ${mem} -i input.txt -o output.txt code`;
		return runProcess(command).then((proc) => {
			// Parse the meta file 
			return readFileAsync(path.join(this.folder, 'meta.txt'));
		}).then((content) => {
			let opt: any = {};
			content.split('\n').forEach(function (line) {
				let [name, val] = line.split(':');
				opt[name] = val;
			});
			return opt;
		}).then((opt) => { 
			let verdict: Verdict;
			switch (opt.status) {
				case 'RE':
					verdict = Verdict.RuntimeError;	
				case 'SG':
					verdict = Verdict.RuntimeError;
				case 'TLE':
					verdict = Verdict.TimeLimitExceeded;
				case 'MLE':
					verdict = Verdict.MemoryLimitExceeded;
				default:
					verdict = Verdict.Accepted;	
			}
			let res = new ExecutionResult(verdict, Number(opt.time) * 1000, Number(opt['cg-mem']), path.join(this.boxFolder, 'output.txt'));
			return res;
		});
	}
	cleanup(): Promise<void> {
		return runProcess(`isolate --cleanup -b ${this.pool}`).then(() => {
			IsolateSandbox.Pool.push(this.pool);
			this.pool = -1;
		});
	}
}

/** Get a new sandbox */
export function getSandbox(folder: string, input: string): SandboxInterface {
	return new IsolateSandbox(folder, input);
}

// Helper commands 

function copyAsync(source: string, dest: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		fs.copy(source, dest, {
			clobber: true
		}, (err) => {
			if (err) reject(err);
			resolve();
		});
	});
}

function readFileAsync(path: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		fs.readFile(path, 'utf8', (err, file) => {
			if (err) reject(err);
			resolve(file);
		});
	});
}