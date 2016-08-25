/// <reference path="../../../typings/index.d.ts" />
import * as Promise from 'bluebird'
import * as fs from 'fs'
import * as path from 'path'
import { CompletedProcess, runProcess } from '../Process/process'
import { LanguageInterface } from '../Languages/languages'

export type SubmitType = 'single' | 'library' | 'outputOnly'; 
export function checkSubmitType(s: any): s is SubmitType {
	return s === 'single' || s === 'library' || s === 'outputOnly';
}

export interface CompilerInterface {
	language: LanguageInterface;
	/**
	 * From sent code, compile it and return the executable file path 
	 */
	compile(folder: Promise<string>, code: string, header?: string, grader?: string): Promise<string>;
}

class SingleCompiler implements CompilerInterface {
	constructor(public language: LanguageInterface) {

	}
	compile(folder: Promise<string>, code: string): Promise<string> {
		return folder.then((dir) => {
			return writeFileAsync(path.join(dir, 'code' + this.language.extName), code)
				.then(() => {
					return runProcess(this.language.program.compile, dir);
				}).then((proc) => { 
					if (proc.returnCode === 0) return dir;
					return Promise.reject(new Error('Compile Error: ' + proc.stderr));
				}); 
		});
	}
}

class LibraryCompiler implements CompilerInterface {
	constructor(public language: LanguageInterface) {

	}
	compile(folder: Promise<string>, code: string, header: string, grader: string): Promise<string> {
		return folder.then((dir) => {
			return Promise.all([
				writeFileAsync(path.join(dir, 'grader' + this.language.hdrName), header),
				writeFileAsync(path.join(dir, 'code' + this.language.extName), code),
				writeFileAsync(path.join(dir, 'grader' + this.language.extName), grader)
			]).then(() => {
				return runProcess(this.language.library.compile, dir);
			}).then((proc) => { 
				if (proc.returnCode === 0) return dir;
				return Promise.reject(new Error('Compile Error: ' + proc.stderr));
			}); 
		});
	}
}

export function getCompiler(s: SubmitType, l: LanguageInterface): CompilerInterface {
	if (s === 'single') return new SingleCompiler(l);
	if (s === 'library') return new LibraryCompiler(l);
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