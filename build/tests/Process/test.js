"use strict";
const Promise = require('bluebird');
const Process = require('../../app/Process/process');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;
describe('Process', function () {
    describe('Compiler tests', function () {
        it('Should show an error saying no input files', function () {
            let process = Process.runProcess('g++');
            return Promise.all([
                assert.eventually.propertyVal(process, 'returnCode', 1, 'Return code should be 1'),
                assert.eventually.propertyNotVal(process, 'stderr', '', 'Stderr should not be empty')
            ]);
        });
        it('Should be okay when calling g++ -v', function () {
            let process = Process.runProcess('g++ -v');
            return Promise.all([
                assert.eventually.propertyVal(process, 'returnCode', 0, 'Return code should be 0')
            ]);
        });
        it('Should show a compile error (with error 1)', function () {
            this.timeout(5000);
            let process = Process.runProcess('g++ -o run compileError.cpp', __dirname);
            return Promise.all([
                assert.eventually.propertyVal(process, 'returnCode', 1, 'Return code should be 1'),
                assert.eventually.propertyNotVal(process, 'stderr', '', 'Stderr should not be empty')
            ]);
        });
        it('Should compiles successfully', function () {
            this.timeout(5000);
            let process = Process.runProcess('g++ -o run compileSucess.cpp', __dirname);
            return Promise.all([
                assert.eventually.propertyVal(process, 'returnCode', 0, 'Return code should be 0')
            ]);
        });
        it('Should run the file successfully', function () {
            let process = Process.runProcess('./run', __dirname);
            return Promise.all([
                assert.eventually.propertyVal(process, 'returnCode', 0, 'Should exit normally'),
                assert.eventually.propertyVal(process, 'stdout', 'Kagami!\n', 'Correct file run!')
            ]).then(() => {
                return Process.runProcess('rm run', __dirname);
            });
        });
    });
});
//# sourceMappingURL=test.js.map