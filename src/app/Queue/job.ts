/// <reference path='../../typings/index.d.ts' />
import Promise = require('bluebird');
import debug = require('debug');
import uuid = require('uuid');
import Sandbox = require('./sandbox');

export { IsolateSandbox, DirectBox, ExecutionResult } from './sandbox';

export interface JobInterface {
  /**
   * The uuid of the job
   * @type {string}
   */
  id: string;
  /**
   * The sandbox for the job
   * @type {Sandbox.SandboxInterface}
   */
  sandbox: Sandbox.SandboxInterface;
  /**
   * A custom name for the job
   * @type {string}
   */
  name: string;
  /**
   * Runs the sandbox and the returns the result
   * @return {Promise<Sandbox.ExecutionResult>} The result from the sandbox
   */
  start(): Promise<Sandbox.ExecutionResult>;
}

export class Job implements JobInterface {
  id: string;
  Debug: debug.Debugger;
  constructor(public name: string, public sandbox: Sandbox.SandboxInterface) {
    this.id = uuid.v4();
    this.Debug = debug('kjudge:job:' + this.id);
  }
  start(): Promise<Sandbox.ExecutionResult> {
    this.Debug(this.name + ': Job started');
    return Promise.resolve()
    .then(() => {
      return this.sandbox.prepare();
    })
    .then(() => {
      return this.sandbox.run();
    })
    .then((res) => {
      this.Debug(this.name + ': Job ended');
      this.sandbox.cleanup();
      return res;
    })
  }
}
