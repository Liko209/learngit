/*
 * @Author: doyle.wu
 * @Date: 2019-07-08 10:11:17
 */
import { Config } from '../config';
import { BaseGatherer } from './baseGatherer';
import * as bluebird from 'bluebird';

abstract class DebugGatherer extends BaseGatherer {

  async afterPass(passContext) {
    try {
      const result = await this._afterPass(passContext)
      if (Config.debugMode) {
        this.logger.info("start debug...");
        await bluebird.delay(Number.MAX_VALUE);
      }
      return result;
    } catch (err) {
      this.logger.error((err as Error).stack);
      throw err;
    }
  }
}

export {
  DebugGatherer
}
