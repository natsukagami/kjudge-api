/**
 * the User model
 */

export interface UserInterface {
	id: number;	
}

export class User implements UserInterface {
	constructor(public id: number) {

	}
}