"use strict";
const Promise = require('bluebird');
const fs = require('fs-extra');
const debug = require('debug');
const temp = require('temp');
const path = require('path');
const uuid = require('uuid');
const FSDebug = debug('kjudge:fs');
class FSQueue {
    constructor() {
        this.queue = [];
        this.current = [];
        this.runQueue();
    }
    makePromise(f) {
        let id = uuid.v4();
        let res = new Promise((resolve, reject) => {
            this.queue.push([() => {
                    resolve(f());
                }, id]);
        });
        res.then(() => {
            this.current.splice(this.current.findIndex((val) => {
                return val === id;
            }), 1);
        });
        return res;
    }
    runQueue() {
        if (this.current.length < FSQueue.concurrency && this.queue.length > 0) {
            let x = FSQueue.concurrency - this.current.length;
            while (x-- && this.queue.length > 0) {
                let item = this.queue.shift();
                this.current.push(item[1]);
                item[0]();
            }
        }
        Promise.delay(200).then(() => { this.runQueue(); });
    }
    push(f) {
        return this.makePromise(f);
    }
}
exports.FSQueue = FSQueue;
let QQ = new FSQueue();
function copyAsync(source, dest) {
    function _copyAsync(source, dest) {
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
    return QQ.push(() => { return _copyAsync(source, dest); });
}
exports.copyAsync = copyAsync;
function walkAsync(dir, prefix = null) {
    function _walkAsync(dir, prefix = null) {
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
                        return _walkAsync(path.join(dir, file), path.join(prefix, file));
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
    return QQ.push(() => { return _walkAsync(dir, prefix); });
}
exports.walkAsync = walkAsync;
function readFileAsync(path) {
    function _readFileAsync(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', (err, file) => {
                if (err)
                    reject(err);
                resolve(file);
            });
        });
    }
    return QQ.push(() => { return _readFileAsync(path); });
}
exports.readFileAsync = readFileAsync;
function mkdirTempAsync(prefix) {
    function _mkdirTempAsync(prefix) {
        return new Promise((resolve, reject) => {
            temp.mkdir(prefix, (err, dir) => {
                if (err)
                    reject(err);
                else
                    resolve(dir);
            });
        });
    }
    return QQ.push(() => { return _mkdirTempAsync(prefix); });
}
exports.mkdirTempAsync = mkdirTempAsync;
//# sourceMappingURL=misc.js.map