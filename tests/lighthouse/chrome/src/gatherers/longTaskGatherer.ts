/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { BaseGatherer } from ".";
import { FunctionUtils, PptrUtils } from '../utils';

class LongTaskGatherer extends BaseGatherer {
  private tasks: Array<any>;

  async _beforePass(passContext) {
  }

  /*
    {
      "name": "self",
      "entryType": "longtask",
      "startTime": 17227.03999999794,
      "duration": 325.02499999827705,
      "attribution": [
        {
          "name": "unknown",
          "entryType": "taskattribution",
          "startTime": 0,
          "duration": 0,
          "containerType": "iframe",
          "containerSrc": "",
          "containerId": "",
          "containerName": ""
        }]
    }
  */
  async _pass(passContext) {
    this.tasks = new Array();

    const driver = passContext.driver;
    const ws = await driver.wsEndpoint();
    const browser = await PptrUtils.connect(ws);

    FunctionUtils.bindEvent(browser, "targetchanged", async target => {
      let page = await target.page();
      if (page) {
        FunctionUtils.bindEvent(page, "console", msg => {
          const prefix = "[LongTask]";
          const str = msg._text;
          if (str.startsWith(prefix)) {
            this.tasks.push(JSON.parse(str.substr(prefix.length)));
          }
        });

        await page.evaluate(() => {
          if (window['_longTaskObserver']) {
            return;
          }

          Object.defineProperty(window, "_longTaskObserver", { value: true });

          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (let i = 0; i < entries.length; i++) {
              console.log(['[LongTask]', JSON.stringify(entries[i])].join(''));
            }
          });
          observer.observe({ entryTypes: ["longtask"] });
        });
      }
    });
  }

  async _afterPass(passContext) {
    return { longTasks: this.tasks };
  }
}

export { LongTaskGatherer };
