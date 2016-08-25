/**
 * the Problem model
 */

/// <reference path="../../../typings/index.d.ts" />
const PROBLEM_PATH = '/home/natsukagami/Projects/ttjudge-discord/problems';
import { ScorerType, ScorerInterface, getScorer } from '../Scorer/scorer'
import { Test } from './test'
import { SubmitType } from '../Compiler/compiler'
import * as path from 'path';

export interface ProblemInterface {
	submitType: SubmitType;
	scorerType: ScorerType;
	scorer: ScorerInterface;
	name: string;
	header: string;
	grader: string;
	folder: string;
	tests: Array<Test>;
}

export class Problem implements ProblemInterface {
	scorer: ScorerInterface;
	tests: Array<Test> = [];
	folder: string;
	constructor(public name: string, public submitType: SubmitType, public scorerType: ScorerType, public header: string = "", public grader: string = "") {
		this.scorer = getScorer(this.scorerType);
		this.folder = path.join(PROBLEM_PATH, this.name.toLowerCase());
	}
	/** Add a test */
	pushTest(test: Test): void {
		test.inputFile = path.join(this.folder, test.inputFile);
		if (test.outputFile) test.outputFile = path.join(this.folder, test.outputFile);
		this.tests.push(test);
	}
}