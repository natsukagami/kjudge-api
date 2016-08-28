/**
 * The Submission model
 */
/// <reference path="../../../typings/index.d.ts" />
import { Problem } from '../Problem/problem'
import { LanguageInterface, Language, getLanguage } from '../Languages/languages'
import { SubmitType, getCompiler, CompilerInterface } from '../Compiler/compiler'
import { TestInterface } from '../Problem/test'
import { ResultInterface, Result } from './result'
import { getRunner, RunnerInterface } from '../Runner/runner'
import { ConcurrentQueue } from '../Queue/queue'
import * as temp from 'temp'
import * as Promise from 'bluebird'
import jsonminify = require('jsonminify');
import * as fs from 'fs';
import * as path from 'path';

const SETTINGS: any = JSON.parse(jsonminify(fs.readFileSync(path.join(__dirname, '../../bin/config.json'), 'utf-8')));

temp.track();
// Let's build for temp an async function, since we can't promisify it in TS :( 
function mkdirAsync(affixes: string = ""): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		temp.mkdir(affixes, (err, dir) => {
			if (err) reject(err); 
			resolve(dir);
		})
	});
}

export interface SubmissionInterface {
	id: number;
	problem: Problem;
	language: LanguageInterface;
	code: string;
	compiler: CompilerInterface;
	folder: Promise<string>;
	result: Array<ResultInterface>;
	score: number;
	judge(): Promise<void>;
}

export let Queue = new ConcurrentQueue(SETTINGS.tests_concurrency);

export class Submission implements SubmissionInterface {
	language: LanguageInterface; 
	result: Array<Result> = [];
	folder: Promise<string>;
	compiler: CompilerInterface;
	score: number = -1;
	constructor(public id: number, public problem: Problem, language: Language, public code: string) {
		this.language = getLanguage(language);
		this.folder = mkdirAsync('submission-');
		this.compiler = getCompiler(this.problem.submitType, this.language);
	}
	judge(): Promise<void> {
		let ret = this.compiler.compile(this.folder, this.code, this.problem.compare, this.problem.header, this.problem.grader).then((file) => {
			return Promise.map<TestInterface, Result>(this.problem.tests, (item) => {
				let runner: RunnerInterface = getRunner();
				return this.folder.then((dir) => {
					return Queue.push(dir, item, (this.problem.compare === ""));
				})
			})
		})
		.then((results) => { 
			this.result = results;
			this.score = this.problem.scorer.score(this.problem.tests, results);
		})
		.catch((err) => {
			this.result = [];
			this.score = -1;
			});
		ret.finally(() => {
			temp.cleanup();
		});
		return ret;
	}
}
