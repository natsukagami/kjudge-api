export interface TestInterface {
	id: number;
	inputFile: string;
	outputFile?: string;
	timeLimit: number; // In miliseconds
	memoryLimit: number; // In KB
	score: number;
	group: number;
}

export class Test implements TestInterface {
	constructor(public id: number, public inputFile: string, public outputFile: string = null,
		public timeLimit: number, public memoryLimit: number, public score: number, public group: number = 0) {
		
	}
}
