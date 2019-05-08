/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { PptrUtils, FunctionUtils } from "../utils";
import { PerformanceMetric } from "../gatherers";
import { globals } from "../globals";
import { BaseGatherer } from ".";

const EXTENSION_ID = "ijjcejlmgpmagghhloglnenalapepejo";
const EXTENSION_TAG = "[PerformanceMonitor]";

class ProcessGatherer2 extends BaseGatherer {
  private processIntervalId;
  private resolve;
  private timeoutId;
  private browser;
  private indexReceived;
  private metrics: Array<PerformanceMetric> = new Array();

  async _beforePass(passContext) {
    const driver = passContext.driver;
    let ws = await driver.wsEndpoint();
    this.browser = await PptrUtils.connect(ws);

    let isSteady = false;
    let memoryArr = [], min, max;

    this.indexReceived = false;
    let listener = (data) => {
      if (data.response
        && data.response.url && data.response.url.indexOf('/api/index?newer_than=') > -1
        && data.response.status && data.response.status === 200) {
        this.indexReceived = true;
        driver.off('Network.responseReceived', listener);
      }
    };

    driver.on('Network.responseReceived', listener);

    FunctionUtils.bindEvent(this.browser, "targetchanged", async target => {
      let page = await target.page();
      if (page) {
        FunctionUtils.bindEvent(page, "console", async msg => {
          if (!this.indexReceived || !this.resolve) {
            return;
          }

          const str = msg._text;
          if (!str.startsWith(EXTENSION_TAG)) {
            return;
          }

          const item = JSON.parse(str.substr(EXTENSION_TAG.length));
          const process = item["process"];
          if (!process) {
            return;
          }
          if (isSteady) {
            if (globals.collectProcessInfo()) {
              this.metrics.push({
                cpu: process["cpu"],
                jsMemoryAllocated: process["jsMemoryAllocated"],
                jsMemoryUsed: process["jsMemoryUsed"],
                privateMemory: process["privateMemory"],
                url: item["url"],
                type: process["type"]
              });
            }
            return;
          }

          memoryArr.push(process["privateMemory"]);
          
          if (memoryArr.length < 5) {
            return;
          }

          min = max = memoryArr[0];
          for (let item of memoryArr) {
            max = Math.max(item, max);
            min = Math.min(item, min);
          }
          memoryArr.shift();

          if ((max - min) <= (max + min) / 20) { // ((x + y) / 2) * 10%
            clearTimeout(this.timeoutId);

            isSteady = true;

            this.resolve();
          }
        });
      }
    });
  }

  async _pass(passContext) {
    return new Promise(async (resolve, reject) => {
      const driver = passContext.driver;

      this.timeoutId = setTimeout(reject, 60000);
      this.resolve = resolve;

      this.processIntervalId = setInterval(async () => {
        await driver.evaluateAsync(`(function() {
                  if (chrome.runtime && chrome.runtime.sendMessage) {
                      chrome.runtime.sendMessage("${EXTENSION_ID}", {});
                  }
                  return true;
              })()`);
      }, 1000);
    });
  }

  async _afterPass(passContext) {
    clearInterval(this.processIntervalId);

    return { metrics: this.metrics };
  }
}

export { ProcessGatherer2 };
