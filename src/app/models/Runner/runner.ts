/// <reference path="../../../typings/index.d.ts" />

import { CompletedProcess, runProcess } from '../Process/process'
import { TestInterface } from '../Problem/test'
import { ResultInterface, Result } from '../Submission/result' 
import { getSandbox, SandboxInterface, ExecutionResult } from './sandbox'
import { Verdict } from '../Submission/result'
import * as Promise from 'bluebird'
/**
 * Should've been called a sandbox (lol)
 */
export interface RunnerInterface {
	run(folder: string, test: TestInterface): Promise<ResultInterface>;
} 

class Runner implements RunnerInterface {
	score_by_diff(output: string, answer: string): Promise<number> {
		return runProcess(`diff -w ${output} ${answer}`).then((proc) => {
			return (proc.returnCode === 0 ? 1 : 0);
		});
	}
	run(folder: string, test: TestInterface): Promise<Result> {
		let sandbox: SandboxInterface = getSandbox(folder, test.inputFile);
		let promise = sandbox.prepare().then(() => {
			return sandbox.run(test.timeLimit, test.memoryLimit);
		}).then((exec) => {
			if (exec.verdict !== Verdict.Accepted) {
				return new Result(test.id, exec.time, exec.memory, exec.verdict, 0);
			}
			return this.score_by_diff(exec.outputFile, test.outputFile).then((correct) => {
				return new Result(test.id, exec.time, exec.memory, (correct ? Verdict.Accepted : Verdict.WrongAnswer), correct * test.score);
			});
			});
		promise.then(() => {
			sandbox.cleanup();
		});
		return promise;
	}
}

export function getRunner() {
	return new Runner();
}