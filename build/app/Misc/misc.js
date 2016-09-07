"use strict";
const Promise = require('bluebird');
const fs = require('fs-extra');
const debug = require('debug');
const temp = require('temp');
const path = require('path');
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
function walkAsync(dir, prefix = null) {
    function statAsync(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err)
                    return reject(err);
                resolve(stats);
            });
        });
    }
    prefix = (prefix ? prefix : dir);
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err)
                return reject(err);
            resolve(Promise.all(files.map((file) => {
                return statAsync(path.join(dir, file)).then(function (stats) {
                    if (stats.isFile())
                        return Promise.resolve(path.join(prefix, file));
                    return walkAsync(path.join(dir, file), path.join(prefix, file));
                });
            })));
        });
    }).then((files) => {
        let ret = [];
        function flatten(arr) {
            arr.forEach((file) => {
                if (typeof file === 'string')
                    ret.push(file);
                else
                    flatten(file);
            });
        }
        flatten(files);
        return ret;
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