/**
 * Defines scorers that will score the submission based on the problem types
 */

import { Test } from '../Problem/test'
import { Result, Verdict } from '../Submission/result'

export type ScorerType = 'single' | 'subtaskMin' | 'subtaskMul'; // Defined by scorers 
export function checkScorerType(s: any): s is ScorerType {
	return s === 'single' || s === 'subtaskMin' || s === 'subtaskMul';
}

export interface ScorerInterface {
	score(testSuite: Array<Test>, testResults: Array<Result>): [number, Array<number>];
}

/** Basic scorers */

class SingleScorer implements ScorerInterface {
	score(testSuite: Array<Test>, testResults: Array<Result>): [number, Array<number>] {
		let totalScore: number = 0;
		if (testSuite.length !== testResults.length) {
			throw new Error('Number of tests and results do not match'); // Should never happen
		}
		for (let i: number = 0; i < testSuite.length; ++i) {
			totalScore += testResults[i].ratio * testSuite[i].score;
		}
		return [totalScore, [totalScore]];
	}
}

class SubtaskMinScorer implements ScorerInterface {
	score(testSuite: Array<Test>, testResults: Array<Result>): [number, Array<number>] {
		let totalScore: number = 0;
		let subtaskScores: Array<number> = [], subtaskResults: Array<number> = [];
		if (testSuite.length !== testResults.length) {
			throw new Error('Number of tests and results do not match'); // Should never happen
		}
		for (let i: number = 0; i < testSuite.length; ++i) {
			let test = testSuite[i], res = testResults[i];
			while (subtaskScores.length <= test.group) {
				subtaskResults.push(1);
				subtaskScores.push(0);
			}
			subtaskScores[test.group] += test.score;
			subtaskResults[test.group] = Math.min(subtaskResults[test.group], res.ratio);
		}
		let arr: Array<number> = [];
		for (let i: number = 0; i < subtaskResults.length; ++i) {
			totalScore += subtaskResults[i] * subtaskScores[i];
			arr.push(subtaskResults[i] * subtaskScores[i]);
		}
		return [totalScore, arr];
	}
}

class SubtaskMulScorer implements ScorerInterface {
	score(testSuite: Array<Test>, testResults: Array<Result>): [number, Array<number>] {
		let totalScore: number = 0;
		let subtaskScores: Array<number> = [], subtaskResults: Array<number> = [];
		if (testSuite.length !== testResults.length) {
			throw new Error('Number of tests and results do not match'); // Should never happen
		}
		for (let i: number = 0; i < testSuite.length; ++i) {
			let test = testSuite[i], res = testResults[i];
			while (subtaskScores.length <= test.group) {
				subtaskResults.push(1);
				subtaskScores.push(0);
			}
			subtaskScores[test.group] += test.score;
			subtaskResults[test.group] *= res.ratio;
		}
		let arr: Array<number> = [];
		for (let i: number = 0; i < subtaskResults.length; ++i) {
			totalScore += subtaskResults[i] * subtaskScores[i];
			arr.push(subtaskResults[i] * subtaskScores[i]);
		}
		return [totalScore, arr];
	}
}

export function getScorer(type: ScorerType): ScorerInterface {
	if (type === 'single') return new SingleScorer();
	if (type === 'subtaskMin') return new SubtaskMinScorer();
	if (type === 'subtaskMul') return new SubtaskMulScorer();
}