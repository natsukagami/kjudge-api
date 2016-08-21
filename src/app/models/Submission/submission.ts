/**
 * The Submission model
 */

import { User } from '../User/user'
import { Problem } from '../Problem/problem'

export interface SubmissionInterface {
	id: number;
	user: User;
	problem: Problem;
}

export class Submission implements SubmissionInterface {
	constructor(public id: number, public user: User, public problem: Problem) {
		
	}
}