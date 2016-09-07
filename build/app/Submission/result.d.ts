export declare enum Verdict {
    Accepted = 0,
    PartiallyCorrect = 1,
    WrongAnswer = 2,
    TimeLimitExceeded = 3,
    RuntimeError = 4,
    MemoryLimitExceeded = 5,
    CompileError = 6,
}
export declare function getVerdictDisplay(v: Verdict): Array<string>;
export interface ResultInterface {
    testId: number;
    runningTime: number;
    memoryUsed: number;
    verdict: Verdict;
    ratio: number;
    message?: string;
}
export declare class Result implements ResultInterface {
    testId: number;
    runningTime: number;
    memoryUsed: number;
    verdict: Verdict;
    ratio: number;
    message: string;
    constructor(testId: number, runningTime: number, memoryUsed: number, verdict: Verdict, ratio: number, message?: string);
}
