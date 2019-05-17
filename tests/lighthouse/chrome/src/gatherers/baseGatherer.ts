/*
 * @Author: doyle.wu
 * @Date: 2019-05-08 09:35:39
 */
import { LogUtils } from "../utils";

const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");

abstract class BaseGatherer extends Gatherer {
  protected logger;

  constructor() {
    super();
    this.logger = LogUtils.getLogger(this.constructor.name);
    this.l
  }

  async beforePass(passContext) {
    try {
      return await this._beforePass(passContext)
    } catch (err) {
      this.logger.error((err as Error).stack);
      throw err;
    }
  }

  async pass(passContext) {
    try {
      return await this._pass(passContext)
    } catch (err) {
      this.logger.error((err as Error).stack);
      throw err;
    }
  }

  async afterPass(passContext) {
    try {
      return await this._afterPass(passContext)
    } catch (err) {
      this.logger.error((err as Error).stack);
      throw err;
    }
  }

  abstract _beforePass(passContext);
  abstract _pass(passContext);
  abstract _afterPass(passContext);
}

export {
  BaseGatherer
}
