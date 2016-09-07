/// <reference path="../../../src/typings/index.d.ts" />
import { Problem } from '../Problem/problem';
import { LanguageInterface, Language } from '../Languages/languages';
import { CompilerInterface } from '../Compiler/compiler';
import { ResultInterface, Result } from './result';
import * as Promise from 'bluebird';
export interface SubmissionInterface {
    id: number;
    problem: Problem;
    language: LanguageInterface;
    code: string;
    compiler: CompilerInterface;
    folder: Promise<string>;
    result: Array<ResultInterface>;
    score: [number, Array<number>];
    judge(): Promise<void>;
}
export declare class Submission implements SubmissionInterface {
    id: number;
    problem: Problem;
    code: string;
    language: LanguageInterface;
    result: Array<Result>;
    folder: Promise<string>;
    compiler: CompilerInterface;
    score: [number, Array<number>];
    constructor(id: number, problem: Problem, language: Language, code: string);
    judge(): Promise<void>;
}
