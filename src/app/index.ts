/// <reference path='../typings/index.d.ts'/>
import { Submission } from './Submission/submission';
import { Problem } from './Problem/problem';
import { Test } from './Problem/test';
import { cQueue, Queue } from './Queue/queue';
import { IsolateSandbox } from './Queue/sandbox';

export = ({
  // Settings
  queueConcurrency = 4,
  isolatePath = '/var/lib/isolate/',
  problemsPath = './problems'
}: {
  queueConcurrency?: number,
  isolatePath?: string,
  problemsPath?: string
}) => {
  cQueue.concurrency = queueConcurrency;
  IsolateSandbox.Path = isolatePath;
  Problem.Path = problemsPath;
  return {
    Submission: Submission,
    Problem: Problem,
    Test: Test,
    Queue: Queue
  };
}
