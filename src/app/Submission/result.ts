export enum Verdict {
	Accepted, PartiallyCorrect, WrongAnswer, TimeLimitExceeded, RuntimeError, MemoryLimitExceeded, CompileError
}

export function getVerdictDisplay(v: Verdict): Array<string> {
	switch (v) {
		case Verdict.Accepted:
			return ["Accepted", "AC"];
		case Verdict.PartiallyCorrect:
			return ["Partially Correct", "SS"];
		case Verdict.WrongAnswer:
			return ["Wrong Answer", "WA"];
		case Verdict.TimeLimitExceeded:
			return ["Time Limit Exceeded", "TLE"];
		case Verdict.RuntimeError:
			return ["Runtime Error", "RTE"];
		case Verdict.MemoryLimitExceeded:
			return ["Memory Limit Exceeded", "MLE"];
		case Verdict.CompileError:
			return ["Compile Error", "CE"];
		default:
			throw new Error('Verdict out of range!'); // Should never happen	
	}
}

export interface ResultInterface {
	testId: number,
	runningTime: number,
	memoryUsed: number,
	verdict: Verdict,
	ratio: number;
	message?: string;
}

export class Result implements ResultInterface {
	constructor(public testId: number, public runningTime: number, public memoryUsed: number,
		public verdict: Verdict, public ratio: number, public message: string = "") {

	}
} 