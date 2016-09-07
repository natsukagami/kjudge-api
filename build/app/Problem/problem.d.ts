/// <reference path="../../../src/typings/index.d.ts" />
import { ScorerType, ScorerInterface } from '../Scorer/scorer';
import { Test } from './test';
import { SubmitType } from '../Compiler/compiler';
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
export declare class Problem implements ProblemInterface {
    name: string;
    submitType: SubmitType;
    scorerType: ScorerType;
    compare: string;
    header: string;
    grader: string;
    static Path: string;
    scorer: ScorerInterface;
    tests: Array<Test>;
    folder: string;
    constructor(name: string, submitType: SubmitType, scorerType: ScorerType, compare?: string, header?: string, grader?: string);
    pushTest(test: Test): void;
}
