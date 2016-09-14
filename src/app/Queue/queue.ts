/// <reference path='../../typings/index.d.ts' />
import debug = require('debug');
import Promise = require('bluebird');
import { JobInterface } from './job';
import { ExecutionResult, SandboxInterface } from './sandbox';
import Events = require('events');

type QueueItem = [JobInterface, Function];

class PriorityArray<T> {
	private arr: Array<[T, number]> = [];
	length: number = 0;
	private swap(x: number, y: number): void {
		let t = this.arr[x];
		this.arr[x] = this.arr[y];
		this.arr[y] = t;
	}
	push(item: T, priority: number = 0): void {
		let _raise = (index: number) => {
			if (index === 1) return;
			if (this.arr[(index >> 1) - 1][1] < this.arr[index - 1][1]) {
				this.swap(index - 1, (index >> 1) - 1);
				_raise((index >> 1));
			}
		}
		++this.length;
		this.arr.push([item, priority]);
		_raise(this.arr.length);
	}
	shift(): T {
		--this.length;
		let item = this.arr.shift();
		let _dive = (index: number) => {
			if (index * 2 > this.arr.length) return;
			let x = (index * 2 + 1 > this.arr.length || this.arr[index * 2 - 1][1] > this.arr[index * 2][1] ? index * 2 : index * 2 + 1);
			if (this.arr[index - 1][1] < this.arr[x - 1][1]) {
				this.swap(index - 1, x - 1);
				_dive(x);
			}
		}
		if (this.arr.length) {
			this.arr.unshift(this.arr.pop());
			_dive(1);
		}
		return item[0];
	}
}

// TODO: Add cQueue.concurrency to Settings

export class cQueue {
	private queue: PriorityArray<QueueItem> = new PriorityArray<QueueItem>();
	private current: Array<string> = [];
	public Dispatcher: Events.EventEmitter = new Events.EventEmitter();
	private Debug: debug.Debugger;
	static concurrency: number;
	constructor() {
		this.runJobs();
		this.Debug = debug('kjudge:queue');
		this.Dispatcher.emit('ready');
		this.Debug('Queue Ready');
	}
	private makePromise(j: JobInterface, priority: number): Promise<ExecutionResult> {
		this.Dispatcher.emit('job-queued', j);
		this.Debug('Job #' + j.id + ' queued');
		return new Promise<ExecutionResult>((resolve, reject) => {
			let func = () => {
				this.Dispatcher.emit('job-started', j);
				this.Debug('Job #' + j.id + ' started');
				resolve(j.start().then((res) => {
					this.Dispatcher.emit('job-ended', j);
					this.Debug('Job #' + j.id + ' ended');
					this.current.splice(this.current.findIndex((val: string) => {
						return val === j.id;
					}), 1);
					return res;
				}));
			}
			this.queue.push([j, func], priority);
		});
	}
	private runJobs(): void {
		if (this.current.length < cQueue.concurrency && this.queue.length > 0) {
			let x = cQueue.concurrency - this.current.length;
			while (x-- && this.queue.length > 0) {
				let item = this.queue.shift();
				this.current.push(item[0].id); item[1]();
			}
		}
		Promise.delay(100).then(() => { this.runJobs(); });
	}
	/**
	 * Push the job into the queue
	 * @param  {JobInterface}             j The job to be pushed
	 * @return {Promise<ExecutionResult>}   Promise of the job's completion
	 */
	push(j: JobInterface, priority: number = 0): Promise<ExecutionResult> {
		return this.makePromise(j, priority);
	}
}

export const Queue = new cQueue();
