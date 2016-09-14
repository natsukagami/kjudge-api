"use strict";
const debug = require('debug');
const Promise = require('bluebird');
const Events = require('events');
class PriorityArray {
    constructor() {
        this.arr = [];
        this.length = 0;
    }
    swap(x, y) {
        let t = this.arr[x];
        this.arr[x] = this.arr[y];
        this.arr[y] = t;
    }
    push(item, priority = 0) {
        let _raise = (index) => {
            if (index === 1)
                return;
            if (this.arr[(index >> 1) - 1][1] < this.arr[index - 1][1]) {
                this.swap(index - 1, (index >> 1) - 1);
                _raise((index >> 1));
            }
        };
        ++this.length;
        this.arr.push([item, priority]);
        _raise(this.arr.length);
    }
    shift() {
        --this.length;
        let item = this.arr.shift();
        let _dive = (index) => {
            if (index * 2 > this.arr.length)
                return;
            let x = (index * 2 + 1 > this.arr.length || this.arr[index * 2 - 1][1] > this.arr[index * 2][1] ? index * 2 : index * 2 + 1);
            if (this.arr[index - 1][1] < this.arr[x - 1][1]) {
                this.swap(index - 1, x - 1);
                _dive(x);
            }
        };
        if (this.arr.length) {
            this.arr.unshift(this.arr.pop());
            _dive(1);
        }
        return item[0];
    }
}
class cQueue {
    constructor() {
        this.queue = new PriorityArray();
        this.current = [];
        this.Dispatcher = new Events.EventEmitter();
        this.runJobs();
        this.Debug = debug('kjudge:queue');
        this.Dispatcher.emit('ready');
        this.Debug('Queue Ready');
    }
    makePromise(j, priority) {
        this.Dispatcher.emit('job-queued', j);
        this.Debug('Job #' + j.id + ' queued');
        return new Promise((resolve, reject) => {
            let func = () => {
                this.Dispatcher.emit('job-started', j);
                this.Debug('Job #' + j.id + ' started');
                resolve(j.start().then((res) => {
                    this.Dispatcher.emit('job-ended', j);
                    this.Debug('Job #' + j.id + ' ended');
                    this.current.splice(this.current.findIndex((val) => {
                        return val === j.id;
                    }), 1);
                    return res;
                }));
            };
            this.queue.push([j, func], priority);
        });
    }
    runJobs() {
        if (this.current.length < cQueue.concurrency && this.queue.length > 0) {
            let x = cQueue.concurrency - this.current.length;
            while (x-- && this.queue.length > 0) {
                let item = this.queue.shift();
                this.current.push(item[0].id);
                item[1]();
            }
        }
        Promise.delay(100).then(() => { this.runJobs(); });
    }
    push(j, priority = 0) {
        return this.makePromise(j, priority);
    }
}
exports.cQueue = cQueue;
exports.Queue = new cQueue();
//# sourceMappingURL=queue.js.map