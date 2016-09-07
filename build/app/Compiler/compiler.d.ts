/// <reference path="../../../src/typings/index.d.ts" />
import * as Promise from 'bluebird';
import { LanguageInterface } from '../Languages/languages';
import { SubmissionInterface } from '../Submission/submission';
export declare type SubmitType = 'single' | 'library' | 'outputOnly';
export declare function checkSubmitType(s: any): s is SubmitType;
export interface CompilerInterface {
    language: LanguageInterface;
    submission: SubmissionInterface;
    compile(folder: Promise<string>, code: string, compare?: string, header?: string, grader?: string): Promise<string>;
}
export declare function getCompiler(s: SubmissionInterface): CompilerInterface;
