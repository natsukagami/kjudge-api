/// <reference path='../../typings/index.d.ts' />
import Promise = require('bluebird');
import fs = require('fs-extra');
import debug = require('debug');
import temp = require('temp');
import path = require('path');

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
export function walkAsync(dir: string, prefix: string = null): Promise<Array<string> > {
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
                   return walkAsync(path.join(dir, file), path.join(prefix, file));
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
