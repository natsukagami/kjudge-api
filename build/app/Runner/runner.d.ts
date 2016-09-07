/// <reference path="../../../src/typings/index.d.ts" />
import { TestInterface } from '../Problem/test';
import { SubmissionInterface } from '../Submission/submission';
import { ResultInterface, Result } from '../Submission/result';
import { ProblemInterface } from '../Problem/problem';
import * as Promise from 'bluebird';
export interface RunnerInterface {
    submission: SubmissionInterface;
    problem: ProblemInterface;
    test: TestInterface;
    judge(): Promise<ResultInterface>;
}
export declare class Runner implements RunnerInterface {
    submission: SubmissionInterface;
    test: TestInterface;
    problem: ProblemInterface;
    private score_by_diff(output, answer);
    private score_by_compare(input, output, answer, dir);
    constructor(submission: SubmissionInterface, test: TestInterface);
    judge(): Promise<Result>;
}
