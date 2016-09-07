import { Test } from '../Problem/test';
import { Result } from '../Submission/result';
export declare type ScorerType = 'single' | 'subtaskMin' | 'subtaskMul';
export declare function checkScorerType(s: any): s is ScorerType;
export interface ScorerInterface {
    score(testSuite: Array<Test>, testResults: Array<Result>): [number, Array<number>];
}
export declare function getScorer(type: ScorerType): ScorerInterface;
