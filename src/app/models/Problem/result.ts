export enum Verdict {
	Accepted, PartiallyCorrect, WrongAnswer, TimeLimitExceeded, RuntimeError, MemoryLimitExceeded, CompileError
}

export interface ResultInterface {
	testId: number,
	runningTime: number,
	memoryUsed: number,
	verdict: Verdict,
	score: number;
}

export class Result implements ResultInterface {
	constructor(public testId: number, public runningTime: number, public memoryUsed: number, public verdict: Verdict, public score: number) {

	}
} 