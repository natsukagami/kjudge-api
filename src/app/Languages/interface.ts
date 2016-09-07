export class Commands {
	constructor(public compile: string, public run: string) { }
}

export interface LanguageInterface {
	/**
	 * source extension
	 */
	extName: string;
	/**
	 * header extension
	 */
	hdrName: string; 
	program: Commands;
	library: Commands;
}