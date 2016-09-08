/// <reference path='../../typings/index.d.ts' />
import Promise = require('bluebird');
import fs = require('fs-extra');
import debug = require('debug');
import temp = require('temp');
import path = require('path');
import uuid = require('uuid');

// Helper commands

const FSDebug = debug('kjudge:fs');

export class FSQueue {
	queue: Array<[Function, string]> = [];
	private current: Array<string> = [];
	static concurrency: number;
	makePromise(f: Function): Promise<any> {
		let id = uuid.v4();
		let res = new Promise<any>((resolve, reject) => {
			this.queue.push([() => {
				resolve(f());
			}, id]);
		});
		res.then(() => { this.current.splice(this.current.findIndex((val: string) => {
			return val === id;
		}), 1); });
		return res;
	}
	constructor() {
		this.runQueue();
	}
	runQueue(): void {
		if (this.current.length < FSQueue.concurrency && this.queue.length > 0) {
			let x = FSQueue.concurrency - this.current.length;
			while (x-- && this.queue.length > 0) {
				let item = this.queue.shift();
				this.current.push(item[1]); item[0]();
			}
		}
		Promise.delay(200).then(() => { this.runQueue(); });
	}
	push(f: Function): Promise<any> {
		return this.makePromise(f);
	}
}

let QQ = new FSQueue();

/**
 * Copy a file to its destination
 * @param  {string}        source Path of the source file
 * @param  {string}        dest   Path of the destination file
 * @return {Promise<void>}        Promise of the process
 */
export function copyAsync(source: string, dest: string): Promise<void> {
	function _copyAsync(source: string, dest: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			fs.copy(source, dest, {
				clobber: true
			}, (err) => {
				if (err) return reject(err);
				FSDebug('Copied `' + source + '` to `' + dest + '`...');
				resolve();
			});
		});
	}
	return QQ.push(() => { return _copyAsync(source, dest); });
}

/**
 * Walks a directory and return the list of files (in no particular order)
 * @param  {string}  dir The folder to be walked
 * @return {Promise}     List of files
 */
export function walkAsync(dir: string, prefix: string = null): Promise<Array<string> > {
 function _walkAsync(dir: string, prefix: string = null): Promise<Array<string> > {
	 function statAsync(path: string): Promise<fs.Stats> {
	     return new Promise<fs.Stats>((resolve, reject) => {
	         fs.stat(path, (err, stats) => {
	             if (err) return reject(err);
	             resolve(stats);
	         })
	     })
	 }
	 prefix = (prefix ? prefix : dir);
	 return new Promise<any>((resolve, reject) => {
	   fs.readdir(dir, (err, files) => {
	       if (err) return reject(err);
	       resolve(Promise.all(files.map((file) => {
	           return statAsync(path.join(dir, file)).then(function(stats): Promise<string | Array<string>> {
	               if (stats.isFile()) return Promise.resolve(path.join(prefix, file));
	               return _walkAsync(path.join(dir, file), path.join(prefix, file));
	           })
	       })));
	   });
	 }).then((files: Array<string | Array<string>>) => {
	     let ret = [];
	     function flatten(arr: Array<string | Array<string>>) {
	         arr.forEach((file) => {
	             if (typeof file === 'string') ret.push(file);
	             else flatten(file);
	         });
	     }
	     flatten(files);
	     return ret;
	 });
 }
 return QQ.push(() => { return _walkAsync(dir, prefix); });
}

/**
 * Reads a file and returns its content, parsed with utf-8 encoding
 * @param  {string}          path Path to the file
 * @return {Promise<string>}      Promise of the content
 */
export function readFileAsync(path: string): Promise<string> {
	function _readFileAsync(path: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			fs.readFile(path, 'utf8', (err, file) => {
				if (err) reject(err);
				resolve(file);
			});
		});
	}
	return QQ.push(() => { return _readFileAsync(path); });
}

/**
 * Creates a temp folder
 * @param  {string}          prefix Prefix of the temp folder
 * @return {Promise<string>}        Path of the created folder
 */
export function mkdirTempAsync(prefix: string): Promise<string> {
	function _mkdirTempAsync(prefix: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			temp.mkdir(prefix, (err, dir) => {
				if (err) reject(err); else resolve(dir);
			})
		});
	}
	return QQ.push(() => { return _mkdirTempAsync(prefix); });
}
