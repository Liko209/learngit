/*
 * @Author: doyle.wu
 * @Date: 2019-05-23 15:21:25
 */
import 'testcafe';
import { LogUtils } from '../utils';
import { PerformanceInfo } from '../models';

const trace = '[PerformanceTracer]';
const logger = LogUtils.getLogger(__filename);

class MetricHelper {
  private t: TestController;
  private lastConsoleIndex: number;
  private gatherer: boolean;
  private filters: Array<string>;
  private timeId: NodeJS.Timeout;
  private result: { [key: string]: Array<PerformanceInfo> };

  constructor(t: TestController) {
    this.t = t;
    this.lastConsoleIndex = 0;
  }

  async begin(filters: Array<string>) {
    await this.end();

    this.filters = !!filters ? filters : [];

    this.result = {};
    for (let k of this.filters) {
      this.result[k] = [];
    }

    await this._gathererPerformanceTrace();
    this.timeId = setInterval(async () => {
      if (!this.gatherer) {
        return;
      }
      await this._gathererPerformanceTrace();
    }, 1000);

    this.gatherer = true;
  }

  async end() {
    this.gatherer = false;

    if (this.timeId) {
      clearInterval(this.timeId);
    }

    this.timeId = undefined;
  }

  getResult(): { [key: string]: Array<PerformanceInfo> } {
    return this.result;
  }

  private async _gathererPerformanceTrace(): Promise<void> {
    let log: string, arr;
    const { info } = await this.t.getBrowserConsoleMessages();
    const prefix = "%cMAIN%c [PerformanceTracer] color: #ff8800 color: #516bf0";
    const lastIndex = this.lastConsoleIndex;
    this.lastConsoleIndex = info.length;
    
    if (!this.gatherer) {
      return;
    }
    for (let index = lastIndex; index < info.length; index++) {
      log = info[index];
      if (log.startsWith(prefix)) {
        log = log.substring(prefix.length);
        try {
          arr = JSON.parse(log);
          for (let item of arr) {
            let { key, time, count, infos } = item;

            if (!key || this.filters.indexOf(key) < 0 || !time) {
              continue;
            }

            count = count || count === 0 ? count : -1;
            infos = !!infos ? infos : {};

            let res = {
              key, time, count, infos
            };
            logger.info(`${trace}${JSON.stringify(res)}`);
            this.result[key].push(res);
          }
        } catch (err) { }
      }
    }

  }
}

export {
  MetricHelper
}
