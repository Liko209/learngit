/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");
import * as bluebird from "bluebird";
import { PptrUtils } from '../../utils';
import { Page } from '../../pages';
import * as pidusage from 'pidusage';

class PerformanceMetric {
  public cpu: number;
  public jsMemoryAllocated: number;
  public jsMemoryUsed: number;
  public privateMemory: number;
  public url: string;
  public type: string;
}

class ProcessGatherer extends Gatherer {
  private intervalId;
  private metrics: Array<PerformanceMetric> = new Array();

  async beforePass(passContext) {
    const driver = passContext.driver;
    let ws = await driver.wsEndpoint();
    let browser = await PptrUtils.connect(ws);
    let pid = browser.process().pid;
    let p = new Page({ browser });
    let page = await p.page();

    this.intervalId = setInterval(async () => {
      let url = await page.evaluate(() => {
        return location.protocol + '//' + location.host + location.pathname;
      });
      let heapUsage = await driver.sendCommand('Runtime.getHeapUsage');
      pidusage(pid, (err, stats) => {
        this.metrics.push({
          cpu: stats.cpu,
          jsMemoryAllocated: heapUsage["usedSize"],
          jsMemoryUsed: heapUsage["totalSize"],
          privateMemory: stats.memory,
          url: url,
          type: 'electron'
        });
      });
    }, 1000);
  }

  async afterPass(passContext) {
    await bluebird.delay(5000);

    clearInterval(this.intervalId);

    return { metrics: this.metrics };
  }

  pass(passContext) { }
}

export { ProcessGatherer, PerformanceMetric };
