/*
 * @Author: doyle.wu
 * @Date: 2019-05-08 09:35:39
 */
import { LogUtils } from "../utils";
import { PptrUtils, FunctionUtils } from "../utils";

const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");

abstract class BaseGatherer extends Gatherer {
  protected logger;
  protected consoleMetrics: { [key: string]: Array<any> }
  protected _gathererConsole: boolean;

  constructor() {
    super();
    this.logger = LogUtils.getLogger(this.constructor.name);
    this.consoleMetrics = {};
    this._gathererConsole = false;
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

  beginGathererConsole() {
    this._gathererConsole = true;
  }

  endGathererConsole() {
    this._gathererConsole = false;
  }

  async gathererConsole(keys: Array<string>, passContext): Promise<void> {
    for (let k of keys) {
      this.consoleMetrics[k] = [];
    }

    const trace = '[PerformanceTracer]';
    const driver = passContext.driver;
    let ws = await driver.wsEndpoint();
    this.browser = await PptrUtils.connect(ws);

    FunctionUtils.bindEvent(this.browser, "targetchanged", async target => {
      let page = await target.page();
      if (page) {
        FunctionUtils.bindEvent(page, "console", async msg => {
          if (!this._gathererConsole) {
            return;
          }

          if (!msg._args || msg._args.length !== 4 || msg._text.indexOf(trace) < 0) {
            return;
          }

          let flag = await msg._args[0].jsonValue();
          let json = await msg._args[3].jsonValue();

          if (!flag.endsWith(trace)) {
            return;
          }

          let arr = JSON.parse(json);

          for (let item of arr) {
            let { key, time, count, infos } = item;
            if (keys.indexOf(key) < 0) {
              continue;
            }

            count = count ? count : -1;
            infos = infos ? infos : {};

            let res = {
              key, time, count, infos
            };
            this.logger.info(`${trace}${JSON.stringify(res)}`);
            this.consoleMetrics[key].push(res);
          }
        });
      }
    });
  }

  abstract _beforePass(passContext);
  abstract _pass(passContext);
  abstract _afterPass(passContext);
}

export {
  BaseGatherer
}
