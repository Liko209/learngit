import { getLogger } from 'log4js';

const logger = getLogger(__filename);

export class MiscUtils {
  static async sleep(time: number): Promise<void> {
    return new Promise<void>((res, rej) => {
      setTimeout(res, time);
    });
  }

  static async retryAsync(cb: () => Promise<any>, errorHandler: (any) => Promise<boolean>, maxRetry: number = 10) {
    let times = 0;
    while (true) {
      try {
        return await cb();
      } catch (err) {
        if (times++ >= maxRetry || !(await errorHandler(err))) {
          throw err;
        }
        logger.warn('retry on error!');
      }
    }
  }
}
