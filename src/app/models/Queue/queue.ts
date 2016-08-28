
/// <reference path="../../../typings/index.d.ts" />
import * as Promise from 'bluebird'
import { SubmissionInterface } from '../Submission/submission'
import { ResultInterface } from '../Submission/result'
import { RunnerInterface, getRunner } from '../Runner/runner'
import { TestInterface } from '../Problem/test'

class TestItem {
	static Pool: number = 0;
	id: number; 
	constructor(public folder: string, public test: TestInterface, public useDiff = true) {
		this.id = ++TestItem.Pool;
	}
	judge(): Promise<ResultInterface> {
		return getRunner().judge(this.folder, this.test, this.useDiff);
	}
}

/** A queue for dealing with concurrent requests */
export class ConcurrentQueue {
	q: Array<[TestItem, Function]> = [];
	con: Array<number> = [];
	constructor(public concurrent: number = 1) {
	}
	private createJob(q: TestItem): Promise<ResultInterface> {
		let ret = q.judge();
		ret.then(() => {
			this.con.splice(this.con.findIndex((value) => {
				return value === q.id;
			}), 1);
			this.startQueue(); 
		});
		return ret;
	}
	private startQueue(): void {
		while (this.q.length > 0 && this.con.length < this.concurrent) {
			var a: [TestItem, Function] = this.q.shift();
			this.con.push(a[0].id);
			a[1](this.createJob(a[0]));
		}
	}
	push(f: string, t: TestInterface, d: boolean): Promise<ResultInterface> {
		let s = new TestItem(f, t, d);
		return new Promise<ResultInterface>((resolve, reject) => {
			this.q.push([s, resolve]);
			this.startQueue();
		});
	}
}
