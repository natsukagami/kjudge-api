"use strict";
const Promise = require('bluebird');
const fs = require('fs-extra');
const debug = require('debug');
const temp = require('temp');
const FSDebug = debug('kjudge:fs');
function copyAsync(source, dest) {
    return new Promise((resolve, reject) => {
        fs.copy(source, dest, {
            clobber: true
        }, (err) => {
            if (err)
                return reject(err);
            FSDebug('Copied `' + source + '` to `' + dest + '`...');
            resolve();
        });
    });
}
exports.copyAsync = copyAsync;
function walkAsync(dir) {
    return new Promise((resolve, reject) => {
        let items = [];
        let walker = fs.walk(dir)
            .on('readable', () => {
            let item;
            while ((item = walker.read())) {
                if (item.stats.isFile())
                    items.push(item.path);
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
exports.walkAsync = walkAsync;
function readFileAsync(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, file) => {
            if (err)
                reject(err);
            resolve(file);
        });
    });
}
exports.readFileAsync = readFileAsync;
function mkdirTempAsync(prefix) {
    return new Promise((resolve, reject) => {
        temp.mkdir(prefix, (err, dir) => {
            if (err)
                reject(err);
            else
                resolve(dir);
        });
    });
}
exports.mkdirTempAsync = mkdirTempAsync;
//# sourceMappingURL=misc.js.map