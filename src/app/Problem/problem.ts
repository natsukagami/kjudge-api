/**
 * the Problem model
 */

/// <reference path="../../typings/index.d.ts" />

// Load settings
import { ScorerType, ScorerInterface, getScorer } from '../Scorer/scorer'
import { Test } from './test'
import { SubmitType } from '../Compiler/compiler'
import * as path from 'path';
import jsonminify = require('jsonminify');
import * as fs from 'fs';

// TODO: Add Problem.Path to Settings

export interface ProblemInterface {
	submitType: SubmitType;
	scorerType: ScorerType;
	scorer: ScorerInterface;
	name: string;
	compare: string;
	header: string;
	grader: string;
	folder: string;
	tests: Array<Test>;
}

export class Problem implements ProblemInterface {
	static Path: string;
	scorer: ScorerInterface;
	tests: Array<Test> = [];
	folder: string;
	constructor(public name: string, public submitType: SubmitType, public scorerType: ScorerType, public compare: string = "", public header: string = "", public grader: string = "") {
		this.scorer = getScorer(this.scorerType);
		this.folder = path.join(Problem.Path, this.name);
	}
	/** Add a test */
	pushTest(test: Test): void {
		test.inputFile = path.join(this.folder, test.inputFile);
		if (test.outputFile) test.outputFile = path.join(this.folder, test.outputFile);
		this.tests.push(test);
	}
}
