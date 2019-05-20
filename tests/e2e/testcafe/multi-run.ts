import * as child_process from 'child_process';
import { Transform } from 'stream';

import { getLogger } from 'log4js';

import { RUNNER_OPTS } from './config';

const logger = getLogger(__filename);
logger.level = 'info';

class PrefixTransform extends Transform {
    private prefix: Buffer;
    private rest: Buffer;

    constructor(prefix: string) {
        super();
        this.prefix = Buffer.from(prefix);
    }

    _transform(chunk, encoding, callback) {
        this.rest =
            this.rest && this.rest.length ? Buffer.concat([this.rest, chunk]) : chunk;
        let index;
        while ((index = this.rest.indexOf("\n")) !== -1) {
            const line = this.rest.slice(0, ++index);
            this.rest = this.rest.slice(index);
            this.push(Buffer.concat([this.prefix, line]));
        }
        return void callback();
    }

    _flush(callback) {
        if (this.rest && this.rest.length) {
            return void callback(null, Buffer.concat([this.prefix, this.rest]));
        }
    }
}

Promise.all(
  RUNNER_OPTS.BROWSERS.map((browser: string) =>{
    // create worker process by overwrite the BROWSERS env
    const child = child_process.spawn("npm", ['run', 'e2e'], {
        env: { ...process.env, BROWSERS: browser },
    });

    child.stdout.pipe(new PrefixTransform(`[${browser}] `)).pipe(process.stdout);
    child.stderr.pipe(new PrefixTransform(`[${browser}] `)).pipe(process.stderr);

    return new Promise<Number>((resolve, reject) => {
      child.on('exit', (code, signal) => {
        logger.info(`[${browser}] exit with code ${code}`);
        resolve(code);
      });
    });
  })
).then(codes => {
  logger.info(`all child process exists`, codes);
  const code = codes.some(c => c > 0) ? 1: 0;
  process.exit(code);
});
