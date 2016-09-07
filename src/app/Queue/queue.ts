/// <reference path='../../typings/index.d.ts' />
import debug = require('debug');
import Promise = require('bluebird');
import { JobInterface } from './job';
import { ExecutionResult, SandboxInterface } from './sandbox';
import Events = require('events');

type QueueItem = [JobInterface, Function];

// TODO: Add cQueue.concurrency to Settings

export class cQueue {
	private queue: Array<QueueItem> = [];
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
	private makePromise(j: JobInterface): Promise<ExecutionResult> {
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
			this.queue.push([j, func]);
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
	push(j: JobInterface): Promise<ExecutionResult> {
		return this.makePromise(j);
	}
}

export const Queue = new cQueue();
