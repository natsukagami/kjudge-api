/// <reference path="../../typings/index.d.ts" />
import * as Promise from 'bluebird'
import * as path from 'path'
import * as fs from 'fs-extra'
import { walkAsync, copyAsync, readFileAsync } from '../Misc/misc'
import { runProcess, CompletedProcess } from '../Process/process'
import { Verdict } from '../Submission/result'
import debug = require('debug');
import jsonminify = require('jsonminify');

/**
 * ExecutionResult - the result of a sandbox execution
 */
export class ExecutionResult {
	constructor(public verdict: Verdict, public time: number, public memory: number, public process: CompletedProcess) {

	}
}

export interface SandboxInterface {
	folder: string;
	command: string;
	args: Array<string>;
	boxArgs?: Array<string>;
	/**
	 * A prepare function that will be called before the execution
	 */
	prepare(): Promise<void>;
	/**
	 * Runs the program with the intended time and memory limit
	 */
	run(): Promise<ExecutionResult>;
	/**
	 * A function that will be run after the execution.
	 */
	cleanup(): Promise<void>;
}

/**
 * Isolate Sandbox
 *  - Implements the front-end SandboxInterface for the cms-dev/isolate sandbox.
 */
// TODO: Add IsolateSandbox.Path to Settings
export class IsolateSandbox implements SandboxInterface {
	static Pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	static Path;
	pool: number = -1;
	boxFolder: string;
	private Debug: debug.Debugger;
	private process: CompletedProcess;
	constructor(public folder: string, public command: string, public args: Array<string> = [], public boxArgs: Array<string> = []) {

	}
	/**
	 * Gets the box number from the pool
	 */
	private getPool(): Promise<number> {
		if (this.pool !== -1) return Promise.resolve(this.pool);
		return new Promise<number>((resolve, reject) => {
			if (IsolateSandbox.Pool.length > 0) {
				this.pool = IsolateSandbox.Pool.shift();
				this.Debug = debug('kjudge:sandbox:IsolateSandbox#' + this.pool.toString());
				resolve(this.pool);
			}
			resolve(Promise.delay(500).then(() => {
				return this.getPool();
			}));
		});
	}
	/**
	 * Build an arguments array for the isolate sanbox
	 * @param  {number}        time [description]
	 * @param  {number}        mem     [description]
	 * @param  {string}        input   [description]
	 * @param  {string}      output  [description]
	 * @return {Array<string>}         [description]
	 */
	static buildArgs(options: {
		time?: number,
		mem?: number,
		input?: string,
		output?: string
	}): Array<string> {
		let res: Array<string> = [];
		if (options.time) 	res.push('-t', (options.time / 1000).toString(), '-w', (options.time / 1000 * 2).toString());
		if (options.mem)  	res.push('-m', options.mem.toString());
		if (options.input)	res.push('-i', options.input);
		if (options.output)	res.push('-o', options.output);
		return res;
	}
	prepare(): Promise<void> {
		return this.getPool().then(() => {
			/* Init the sandbox */
			this.Debug('Starting prepare...')
			return runProcess('isolate --init --cg -b ' + this.pool.toString());
		}).then((proc) => {
			if (proc.returnCode > 0) return Promise.reject(new Error('isolate failed to init: Maybe it\'s not installed?'));
			this.boxFolder = path.join(IsolateSandbox.Path, this.pool.toString(), 'box');
		}).then(() => {
			return walkAsync(this.folder).then((files) => {
				return Promise.map<string, void>(files, (file) => {
					file = path.relative(this.folder, file);
					return copyAsync(path.join(this.folder, file), path.join(this.boxFolder, file));
				});
			});
		}).then(() => {
			this.Debug('Preparation completed');
		});
	}
	run(): Promise<ExecutionResult> {
		let command: string = `isolate --run --cg -b ${this.pool} -M ${path.join(this.boxFolder, 'meta.txt')} ${this.boxArgs.join(' ')} ${this.command} ${this.args.join(' ')}`;
		this.Debug('Sandbox started')
		return runProcess(command).then((proc) => {
			this.process = proc;
			// Parse the meta file
			return readFileAsync(path.join(this.boxFolder, 'meta.txt'));
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
			let res = new ExecutionResult(verdict, Number(opt.time) * 1000, Number(opt['cg-mem']), this.process);
			return res;
		}).then((res) => {
			if (res.verdict === Verdict.Accepted) {
				return copyAsync(path.join(this.boxFolder, 'output.txt'), path.join(this.folder, 'output.txt')).then(() => {
				// return walkAsync(this.boxFolder).then((files) => {
				// 		return Promise.map<string, void>(files, (file) => {
				// 			file = path.relative(this.boxFolder, file);
				// 			return copyAsync(path.join(this.boxFolder, file), path.join(this.folder, file));
				// 		});
					}).then(() => {
						this.Debug('Sandbox ended: ' + JSON.stringify(res));
						return res;
					});
			}
			return res;
		});
	}
	cleanup(): Promise<void> {
		this.Debug('Cleaning up...');
		return runProcess(`isolate --cleanup -b ${this.pool}`).then(() => {
			IsolateSandbox.Pool.push(this.pool);
		});
	}
}

export class DirectBox implements SandboxInterface {
	id: number;
	static Pool: number = 0;
	Debug: debug.Debugger;
	constructor(public folder: string, public command: string, public args: Array<string> = []) {
		this.id = ++DirectBox.Pool;
		this.Debug = debug('kjudge:sandbox:DirectBox#' + this.id.toString());
	}
	prepare(): Promise<void> {
		// Nothing to prepare
		return Promise.resolve();
	}
	run(): Promise<ExecutionResult> {
		this.Debug('Starting task...');
		let time = new Date();
		return runProcess(`${this.command} ${this.args.join(' ')}`, this.folder, 10000)
			.then((res) => {
				let nwTime = new Date();
				this.Debug('Task done');
				return new ExecutionResult((res.returnCode === 0 ? Verdict.Accepted : Verdict.WrongAnswer), Math.min(10000, nwTime.getTime() - time.getTime()), 0, res);
			});
	}
	cleanup(): Promise<void> {
		return Promise.resolve();
	}
}
