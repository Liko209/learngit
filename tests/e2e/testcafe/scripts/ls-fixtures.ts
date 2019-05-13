import { RUNNER_OPTS } from '../config';
const fixtures = Array.prototype.join.call(RUNNER_OPTS.FIXTURES, '\n');
console.log(fixtures);