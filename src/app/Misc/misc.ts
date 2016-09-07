/// <reference path='../../typings/index.d.ts' />
import Promise = require('bluebird');
import fs = require('fs-extra');
import debug = require('debug');
import temp = require('temp');

// Helper commands

const FSDebug = debug('kjudge:fs');

/**
 * Copy a file to its destination
 * @param  {string}        source Path of the source file
 * @param  {string}        dest   Path of the destination file
 * @return {Promise<void>}        Promise of the process
 */
export function copyAsync(source: string, dest: string): Promise<void> {
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

/**
 * Walks a directory and return the list of files (in no particular order)
 * @param  {string}  dir The folder to be walked
 * @return {Promise}     List of files
 */
export function walkAsync(dir: string): Promise<Array<string> > {
	return new Promise<Array<string> >((resolve, reject) => {
		let items: Array<string> = [];
		let walker = fs.walk(dir)
			.on('readable', () => {
				let item: { path: string, stats: fs.Stats };
				while ((item = walker.read())) {
					if (item.stats.isFile()) items.push(item.path);
				}
			})
			.on('error', (err, item) => {
				reject(new Error(err.message + ' on ' + item.path));
			})
			.on('end', () => {
				resolve(items);
			});
	});
}

/**
 * Reads a file and returns its content, parsed with utf-8 encoding
 * @param  {string}          path Path to the file
 * @return {Promise<string>}      Promise of the content
 */
export function readFileAsync(path: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		fs.readFile(path, 'utf8', (err, file) => {
			if (err) reject(err);
			resolve(file);
		});
	});
}

/**
 * Creates a temp folder
 * @param  {string}          prefix Prefix of the temp folder
 * @return {Promise<string>}        Path of the created folder
 */
export function mkdirTempAsync(prefix: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		temp.mkdir(prefix, (err, dir) => {
			if (err) reject(err); else resolve(dir);
		})
	});
}
