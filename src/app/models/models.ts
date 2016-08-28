import path = require('path');
console.log(path.join(__dirname, '../bin/config.json'))
export { Submission } from './Submission/submission';
export { Problem } from './Problem/problem';
export { Test } from './Problem/test';
export { ConcurrentQueue } from './Queue/queue'