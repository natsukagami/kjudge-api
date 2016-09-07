/// <reference path="../../typings/index.d.ts" />
import * as Promise from 'bluebird'
import * as fs from 'fs'
import * as path from 'path'
import { LanguageInterface } from '../Languages/languages'
import { SubmissionInterface } from '../Submission/submission';
import Job = require('../Queue/job');
import Queue = require('../Queue/queue');

export type SubmitType = 'single' | 'library' | 'outputOnly';
export function checkSubmitType(s: any): s is SubmitType {
	return s === 'single' || s === 'library' || s === 'outputOnly';
}

export interface CompilerInterface {
	language: LanguageInterface;
	submission: SubmissionInterface;
	/**
	 * From sent code, compile it and return the executable file path
	 */
	compile(folder: Promise<string>, code: string, compare?: string, header?: string, grader?: string): Promise<string>;
}

function compileJob(compiler: CompilerInterface, command: string, folder: string): Promise<Job.ExecutionResult> {
	let s = new Job.DirectBox(folder, command);
	let j = new Job.Job('Compiling file for submission #' + compiler.submission.id, s);
	return Queue.Queue.push(j);
}

class SingleCompiler implements CompilerInterface {
	constructor(public submission: SubmissionInterface, public language: LanguageInterface) {

	}
	compile(folder: Promise<string>, code: string, compare: string = ""): Promise<string> {
		return folder.then((dir) => {
			return Promise.all([
				writeFileAsync(path.join(dir, 'code' + this.language.extName), code),
				(compare === "" ? Promise.resolve(null) : writeFileAsync(path.join(dir, 'compare' + this.language.extName), compare))
			])
				.then(() => {
					let arr: Array<Promise<Job.ExecutionResult> > = [
						compileJob(this, this.language.program.compile, dir)
					];
					if (compare !== "") {
						arr.push(compileJob(this, this.language.program.compile.replace(/code/g, 'compare'), dir));
					}
					return Promise.all(arr);
				}).then((procs) => {
					procs.forEach((proc) => {
						if (proc.process.returnCode !== 0) return Promise.reject(new Error('Compile Error: ' + proc.process.stderr));
					});
					return dir;
				});
		});
	}
}

class LibraryCompiler implements CompilerInterface {
	constructor(public submission: SubmissionInterface, public language: LanguageInterface) {

	}
	compile(folder: Promise<string>, code: string, compare: string = "", header: string, grader: string): Promise<string> {
		return folder.then((dir) => {
			return Promise.all([
				writeFileAsync(path.join(dir, 'grader' + this.language.hdrName), header),
				writeFileAsync(path.join(dir, 'code' + this.language.extName), code),
				writeFileAsync(path.join(dir, 'grader' + this.language.extName), grader),
				(compare === "" ? Promise.resolve(null) : writeFileAsync(path.join(dir, 'compare' + this.language.extName), compare))
			]).then(() => {
				let arr: Array<Promise<Job.ExecutionResult> > = [
					compileJob(this, this.language.library.compile, dir)
				];
				if (compare !== "") {
					arr.push(compileJob(this, this.language.program.compile.replace(/code/g, 'compare'), dir));
				}
				return Promise.all(arr);
			}).then((procs) => {
				procs.forEach((proc) => {
					if (proc.process.returnCode !== 0) return Promise.reject(new Error('Compile Error: ' + proc.process.stderr));
				});
				return dir;
			});
		});
	}
}

export function getCompiler(s: SubmissionInterface): CompilerInterface {
	if (s.problem.submitType === 'single') return new SingleCompiler(s, s.language);
	if (s.problem.submitType === 'library') return new LibraryCompiler(s, s.language);
}

// Helper functions

function writeFileAsync(path: string, content: string): Promise<void> {
	return new Promise<fs.WriteStream>((resolve, reject) => {
			// Opens the file and waits for it to open
			let file = fs.createWriteStream(path);
			file.on('open', () => { resolve(file); });
		}).then((file) => {
			// Writes to file and closes it
			return new Promise<void>((resolve, reject) => {
				file.end(content, 'utf8', () => { resolve(); });
			});
		});
}
