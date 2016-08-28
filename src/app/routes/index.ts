/// <reference path="../../typings/index.d.ts" />
import express = require('express');
import bodyParser = require('body-parser');
import { checkSubmitType } from '../models/Compiler/compiler'
import { checkScorerType } from '../models/Scorer/scorer'
import { Problem, Submission, Test } from '../models/models'

let router = express.Router(); 

/**
 * A little documentation of what to send
 * POST: /submit
 * data: {
 *	problem: {
	 		name: string,
	 		submitType: 'single' | 'library' | 'outputOnly',
			scorerType: 'single' | 'subtaskMin' | 'subtaskMul',
			header: undefined / path-to-header-file,
			grader: undefined / path-to-grader-file,
			tests: [
				{
					id: number,
					group: number, // defaults to 0
					inputFile: string, // path to file
					outputFile: string, // path to file
					timeLimit: number, // in miliseconds
					memoryLimit: number, // in KB
					score: number
				},...
			]
 		},
		submission: {
			id: number,
			language: 'C++',
			code: string 
		}
 * }
 * response: {
 * id: number,
 *	score: number,
 		results: [
			 {
				 testId: number,
				 runningTime: number,
				 memoryUsed: number,
				 verdict: number // lookup in results.ts table 
			 }
		 ]
 * }
 */
router.post('/submit', (req, res: express.Response, next) => {
	let body = req.body;
	let submitType = body.problem.submitType;
	let scorerType = body.problem.scorerType;
	if (!checkSubmitType(submitType) || !checkScorerType(scorerType)) {
		res.json("Wrong problem format");
	}
	let problem = new Problem(body.problem.name, submitType, scorerType, body.problem.compare, body.problem.header, body.problem.grader);
	body.problem.tests.forEach((item) => {
		let test = new Test(item.id, item.inputFile, item.outputFile, item.timeLimit, item.memoryLimit, item.score, item.group);
		problem.pushTest(test);
	});
	let submission = new Submission(body.submission.id, problem, body.submission.language, body.submission.code);
	submission.judge().then(() => {
		res.json({
			id: submission.id,
			score: submission.score,
			results: submission.result
		});
	});
});

export = router;