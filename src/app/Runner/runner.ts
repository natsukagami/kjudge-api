/// <reference path="../../typings/index.d.ts" />

import { CompletedProcess } from '../Process/process'
import { TestInterface } from '../Problem/test'
import { SubmissionInterface } from '../Submission/submission'
import { ResultInterface, Result, Verdict } from '../Submission/result'
import { ProblemInterface } from '../Problem/problem'
import { mkdirTempAsync, copyAsync } from '../Misc/misc'
import * as Promise from 'bluebird'
import Job = require('../Queue/job');
import { Queue } from '../Queue/queue';
import shellEscape = require('shell-escape');
import temp = require('temp');
import path = require('path');
import fs = require('fs-extra');

function enqueueProcess(name: string, command: string, cwd: string = "", priority: number = 0): Promise<CompletedProcess> {
	let s = new Job.DirectBox(cwd, command);
	let j = new Job.Job(name, s);
	return Queue.push(j, priority).then((res) => { return res.process; });
}

export interface RunnerInterface {
	submission: SubmissionInterface;
	problem: ProblemInterface;
	test: TestInterface;
	judge(): Promise<ResultInterface>;
}

export class Runner implements RunnerInterface {
	public problem: ProblemInterface;
	private score_by_diff(output: string, answer: string): Promise<number> {
		return enqueueProcess('Scoring test ' + this.test.id.toString() + ' for submission #' + this.submission.id.toString(),
													shellEscape(['diff', '-w', '-q', output, answer]) + ' >/dev/null 2>/dev/null', '', 20).then((proc) => {
			return (proc.returnCode === 0 ? 1 : 0);
		});
	}
	private score_by_compare(input: string, output: string, answer: string, dir: string): Promise<[number, string]> {
		return enqueueProcess('Scoring test ' + this.test.id.toString() + ' for submission #' + this.submission.id.toString(),
													shellEscape(['./compare', input, output, answer]), dir, 20).then((proc) => {
			/* This should be a number between 0 and 1 */
			let x: number = Number(proc.stdout.replace(/\n/g, '').replace(/\r/g, ''));
			let y: [number, string] = [x, proc.stderr.replace(/\n/g, '').replace(/\r/g, '')];
			return y;
		});
	}
	constructor(public submission: SubmissionInterface, public test: TestInterface) {
		this.problem = this.submission.problem;
	}
	judge(): Promise<Result> {
		let tempFolder = '';
		let promise = Promise.all([
			mkdirTempAsync('runner-'),
			this.submission.folder
		]).then((dirs) => {
			tempFolder = dirs[0];
			// Copy all input files there
			let arr: Array<Promise<void> > = [];
			arr.push(copyAsync(this.test.inputFile, path.join(tempFolder, 'input.txt')));
			if (this.problem.submitType === 'single')
				arr.push(copyAsync(path.join(dirs[1], 'code'), path.join(tempFolder, 'code')));
			else
				arr.push(copyAsync(path.join(dirs[1], 'grader'), path.join(tempFolder, 'code')));
			if (this.problem.compare !== '')
				arr.push(copyAsync(path.join(dirs[1], 'compare'), path.join(tempFolder, 'compare')));
			return Promise.all(arr);
		}).then(() => {
			let s = new Job.IsolateSandbox(tempFolder, './code', [], Job.IsolateSandbox.buildArgs({
				time: this.test.timeLimit,
				mem: this.test.memoryLimit,
				input: 'input.txt',
				output: 'output.txt'
			}));
			let j = new Job.Job('Running test ' + this.test.id.toString() + ' on Submission #' + this.submission.id.toString(), s);
			return Queue.push(j);
		}).then((exec) => {
			if (exec.verdict !== Verdict.Accepted) {
				return new Result(this.test.id, exec.time, exec.memory, exec.verdict, 0);
			}
			if (this.problem.compare === "") return this.score_by_diff(path.join(tempFolder, 'output.txt'), this.test.outputFile).then((correct) => {
				return new Result(this.test.id, exec.time, exec.memory, (correct ? Verdict.Accepted : Verdict.WrongAnswer), correct);
			});
			return this.score_by_compare(this.test.inputFile, path.join(tempFolder, 'output.txt'), this.test.outputFile, tempFolder).then((returns) => {
				let correct = returns[0];
				let v: Verdict = Verdict.WrongAnswer;
				if (correct == 1) v = Verdict.Accepted;
				else if (correct > 0) v = Verdict.PartiallyCorrect;
				return new Result(this.test.id, exec.time, exec.memory, v, correct, returns[1]);
			});
		});
		promise.finally(() => {
			fs.remove(tempFolder);
		});
		return promise;
	}
}
