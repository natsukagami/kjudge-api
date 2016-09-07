/// <reference path="../../src/typings/index.d.ts" />
import { Submission } from './Submission/submission';
import { Problem } from './Problem/problem';
import { Test } from './Problem/test';
import { cQueue } from './Queue/queue';
declare var _default: ({queueConcurrency, isolatePath, problemsPath}: {
    queueConcurrency?: number;
    isolatePath?: string;
    problemsPath?: string;
}) => {
    Submission: typeof Submission;
    Problem: typeof Problem;
    Test: typeof Test;
    Queue: cQueue;
};
export = _default;
