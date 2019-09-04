/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { PptrUtils, FunctionUtils } from "../utils";
import { BaseGatherer } from ".";
import { HomePage } from "../pages";
import * as bluebird from "bluebird";

const EXTENSION_ID = "ijjcejlmgpmagghhloglnenalapepejo";
const EXTENSION_TAG = "[PerformanceMonitor]";

class PerformanceMetric {
  public cpu: number;
  public jsMemoryAllocated: number;
  public jsMemoryUsed: number;
  public privateMemory: number;
  public url: string;
  public type: string;
}

class ProcessGatherer extends BaseGatherer {
  private intervalId;
  private metrics: Array<PerformanceMetric>;

  async _beforePass(passContext) {
    this.metrics = new Array();
    
    const driver = passContext.driver;
    let ws = await driver.wsEndpoint();
    this.browser = await PptrUtils.connect(ws);

    FunctionUtils.bindEvent(this.browser, "targetchanged", async target => {
      let page = await target.page();
      if (page) {
        FunctionUtils.bindEvent(page, "console", msg => {
          const str = msg._text;
          if (str.startsWith(EXTENSION_TAG)) {
            const item = JSON.parse(str.substr(EXTENSION_TAG.length));
            const process = item["process"];
            if (process) {
              this.metrics.push({
                cpu: process["cpu"],
                jsMemoryAllocated: process["jsMemoryAllocated"],
                jsMemoryUsed: process["jsMemoryUsed"],
                privateMemory: process["privateMemory"],
                url: item["url"],
                type: process["type"]
              });
            }
          }
        });
      }
    });

    const page = await (new HomePage(passContext)).page();
    this.intervalId = setInterval(async () => {
      try {
        await page.evaluate(`(function() {
                if (chrome.runtime && chrome.runtime.sendMessage) {
                    chrome.runtime.sendMessage("${EXTENSION_ID}", {});
                }
                return true;
            })()`);
      } catch (err) {
      }
    }, 1000);
  }
  async _afterPass(passContext) {
    const driver = passContext.driver;

    await PptrUtils.collectGarbage(driver);

    await bluebird.delay(10000);

    clearInterval(this.intervalId);

    return { metrics: this.metrics };
  }

  async _pass(passContext) { }
}

export { ProcessGatherer, PerformanceMetric };
