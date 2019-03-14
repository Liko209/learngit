/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");
import { Page } from "../pages";
import { FunctionUtils } from "../utils";

const LOG_REG = /\[\d+:\d+:\d+\/(\d+)\.\d+:VERBOSE1:.+\]\s+(\d+\.?\d*)\s+fps\s*/i

class FpsItem {
  time: string;
  fps: number;
}

class FpsGatherer extends Gatherer {
  private lines: Array<FpsItem> = new Array();
  private needLog: boolean = false;
  private listen: Function = (chunk) => {
    if (!this.needLog) {
      return;
    }

    const line = chunk.toString();

    let arr = LOG_REG.exec(line);
    if (arr) {
      this.lines.push({
        time: arr[1],
        fps: parseFloat(arr[2])
      });
    }
  };

  async beforePass(passContext) {
    const p = new Page(passContext);
    const browser = await p.browser();

    let page = await p.page();

    FunctionUtils.bindEvent(page, "load", async () => {
      await page.evaluate(() => {
        return setInterval(() => {
          let logo = document.querySelector('header > div > div > div h1');
          if (logo) {
            logo.innerHTML = Date.now().toString()
          }
        }, 16);
      });
      this.needLog = true;
    });

    let proc = browser.process();
    if (proc) {
      FunctionUtils.bindEvent(proc.stderr, 'data', this.listen);
    }
  }

  async pass(passContext) {
  }

  async afterPass(passContext) {
    let p = new Page(passContext);

    let browser = await p.browser();
    let proc = browser.process();
    if (proc) {
      FunctionUtils.unbindEvent(proc.stderr, 'data', this.listen);
    }

    let metrics = [], time, list = [];
    for (let line of this.lines) {
      if (time && time !== line.time) {
        this.calcute(time, list, metrics);

        list = [];
      }

      time = line.time;
      list.push(line.fps);
    }

    this.calcute(time, list, metrics);

    return { metrics };
  }

  calcute(time, list, metrics) {
    if (list && list.length > 0 && time) {
      list.sort((a, b) => {
        return a === b ? 0 : (a > b ? 1 : -1);
      });
      let min = list[0];
      let max = list[list.length - 1];
      let avg = parseInt((list.reduce((a, b) => a + b).valueOf() / list.length).toFixed(2));
      let top90 = list[parseInt((0.9 * list.length).toString())];
      let top95 = list[parseInt((0.95 * list.length).toString())];
      metrics.push({
        min, max, avg, top90, top95, time
      });
    }
  }
}

export { FpsGatherer };
