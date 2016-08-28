/// <reference path="../../../typings/index.d.ts" />

import { CompletedProcess, runProcess } from '../Process/process'
import { TestInterface } from '../Problem/test'
import { ResultInterface, Result } from '../Submission/result' 
import { getSandbox, SandboxInterface, ExecutionResult } from './sandbox'
import { Verdict } from '../Submission/result'
import * as Promise from 'bluebird'
import shellEscape = require('shell-escape');
/**
 * Should've been called a sandbox (lol)
 */
export interface RunnerInterface {
	judge(folder: string, test: TestInterface, useDiff?: boolean): Promise<ResultInterface>;
} 

class Runner implements RunnerInterface {
	score_by_diff(output: string, answer: string): Promise<number> {
		return runProcess(shellEscape(['diff', '-w', output, answer])).then((proc) => {
			return (proc.returnCode === 0 ? 1 : 0);
		});
	}
	score_by_compare(input: string, output: string, answer: string, dir: string): Promise<[number, string]> {
		return runProcess(shellEscape(['./compare', input, output, answer]), dir).then((proc) => {
			/* This should be a number between 0 and 1 */ 
			let x: number = Number(proc.stdout.replace(/\n/g, '').replace(/\r/g, ''));
			let y: [number, string] = [x, proc.stderr.replace(/\n/g, '').replace(/\r/g, '')];
			return y;
		});
	}
	judge(folder: string, test: TestInterface, useDiff: boolean): Promise<Result> {
		let sandbox: SandboxInterface = getSandbox(folder, test.inputFile);
		let promise = sandbox.prepare().then(() => {
			return sandbox.run(test.timeLimit, test.memoryLimit);
		}).then((exec) => {
			if (exec.verdict !== Verdict.Accepted) {
				return new Result(test.id, exec.time, exec.memory, exec.verdict, 0);
			}
			if (useDiff) return this.score_by_diff(exec.outputFile, test.outputFile).then((correct) => {
				return new Result(test.id, exec.time, exec.memory, (correct ? Verdict.Accepted : Verdict.WrongAnswer), correct);
			});
			return this.score_by_compare(test.inputFile, exec.outputFile, test.outputFile, folder).then((returns) => {
				let correct = returns[0];
				let v: Verdict = Verdict.WrongAnswer;
				if (correct == 1) v = Verdict.Accepted;
				else if (correct > 0) v = Verdict.PartiallyCorrect;
				return new Result(test.id, exec.time, exec.memory, v, correct, returns[1]);
			});
		});
		promise.finally(() => {
			sandbox.cleanup();
		});
		return promise;
	}
}

export function getRunner() {
	return new Runner();
}