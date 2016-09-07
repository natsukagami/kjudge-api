// The C++ Language Class 

import { Commands, LanguageInterface } from './interface'

const compileCommand = "g++ -std=c++11 -O2 -s -static -o code code.cpp";
const libraryCommand = "g++ -std=c++11 -O2 -s -static -o code code.cpp grader.cpp"
const runCommand = "./code";

export class CPP implements LanguageInterface {
	extName = ".cpp";
	hdrName = ".h";
	program: Commands;
	library: Commands;
	constructor() {
		this.program = new Commands(compileCommand, runCommand);
		this.library = new Commands(libraryCommand, runCommand);
	}
}