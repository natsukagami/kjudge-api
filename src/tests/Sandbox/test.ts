/// <reference path='../../typings/index.d.ts' />
import Promise = require('bluebird');
import Sandbox = require('../../app/Queue/sandbox');
Sandbox.IsolateSandbox.Path = '/var/lib/isolate/';
import Job = require('../../app/Queue/job');
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import fs = require('fs-extra');
import path = require('path');
chai.use(chaiAsPromised);
const assert = chai.assert;

function statAsync(path: string): Promise<fs.Stats> {
  return new Promise<fs.Stats>((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) reject(err); else resolve(stats);
    })
  });
}

describe('Sandbox', function() {
  beforeEach(() => {
    fs.removeSync('code');
    fs.removeSync('output.txt');
  })
  describe('Correct answer', function() {
    it('Should compiles the file successfully', function() {
      // Use the direct sandbox
      let s = new Sandbox.DirectBox(__dirname, 'g++', ['-O2', '--static', '-o', 'code', 'code.cpp']);
      let j = new Job.Job('Compiles example code', s);
      return j.start().then((res) => {
        assert.propertyVal(res, 'verdict', 0, 'It should exit normally');
        return statAsync(path.join(__dirname, 'code')).then((stat) => {
          assert.equal(stat.isFile(), true, 'File should be there');
        });
      });
    });
    it('Should run the file in isolate sandbox', function() {
      // Use isolate sandbox
      let args = Sandbox.IsolateSandbox.buildArgs({
        time: 1000,
        mem: 262144,
        input: 'input.txt',
        output: 'output.txt'
      });
      let s = new Sandbox.IsolateSandbox(__dirname, './code', [], args);
      let j = new Job.Job('Runs example code', s);
      return j.start().then((res) => {
        assert.propertyVal(res, 'verdict', 0, 'It should exit normally');
        return statAsync(path.join(__dirname, 'output.txt')).then((stat) => {
          assert.equal(stat.isFile(), true, 'File should be there');
        });
      })
    });
    it('Should get a correct diff', function() {
      // Use direct sandbox
      let s = new Sandbox.DirectBox(__dirname, 'diff', ['-w', 'output.txt', 'answer.txt']);
      let j = new Job.Job('Diffs the answers', s);
      return j.start().then((res) => {
        assert.propertyVal(res, 'verdict', 0, 'It should exit normally');
      });
    })
  })
});

import Queue = require('../../app/Queue/queue')
Queue.cQueue.concurrency = 4;

describe('Queue', function() {
  let queue = Queue.Queue;
  describe('Queue running test', function() {
    before(() => {
      let s = new Sandbox.DirectBox(__dirname, 'g++', ['-O2', '--static', '-o', 'code', 'code.cpp']);
      let j = new Job.Job('Compiles example code', s);
      return j.start();
    });
    it('Should finish it all', function() {
      this.timeout(10000);
      let all: Array<Promise<Sandbox.ExecutionResult> >  = [];
      for (let i = 1; i <= 10; ++i) {
        fs.copySync(__dirname, path.join(__dirname, '..', i.toString()));
      }
      for (let i = 1; i <= 10; ++i) {
        let args = Sandbox.IsolateSandbox.buildArgs({
          time: 1000,
          mem: 262144,
          input: 'input.txt',
          output: 'output.txt'
        });
        let s = new Sandbox.IsolateSandbox(path.join(__dirname, '..', i.toString()), './code', [], args);
        let j = new Job.Job('Runs example code #' + i.toString(), s);
        all.push(queue.push(j));
      }
      Promise.all(all).finally(() => {
        for (let i = 1; i <= 10; ++i) {
          fs.removeSync(path.join(__dirname, '..', i.toString()));
        }
      });
      return Promise.all(all);
    })
  });
});
