
/// <reference path="../../../typings/index.d.ts" />
import * as Promise from 'bluebird'
import { SubmissionInterface } from '../Submission/submission'
import { ResultInterface } from '../Submission/result'

/** A queue for dealing with concurrent requests */
export class SubmissionQueue {
	q: Array<[SubmissionInterface, Function]> = [];
	con: Array<number> = [];
	constructor(public concurrent: number = 1) {

	}
	private createJob(q: SubmissionInterface): Promise<void> {
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
			var a: [SubmissionInterface, Function] = this.q.shift();
			this.con.push(a[0].id);
			a[1](this.createJob(a[0]));
		}
	}
	push(s: SubmissionInterface): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.q.push([s, resolve]);
			this.startQueue();
		});
	}
}
