/**
 * the Problem model
 */

import { ScorerType, ScorerInterface, getScorer } from './scorer'
export type SubmitType = 'compile' | 'library' | 'output'; 

export interface ProblemInterface {
	id: number;
	submitType: SubmitType;
	scorerType: ScorerType;
	scorer: ScorerInterface;
}

export class Problem implements ProblemInterface {
	scorer: ScorerInterface;
	constructor(public id: number, public submitType: SubmitType, public scorerType: ScorerType) {
		this.scorer = getScorer(this.scorerType);
	}
}