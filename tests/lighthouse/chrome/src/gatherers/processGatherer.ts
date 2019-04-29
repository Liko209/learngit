/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { PptrUtils, FunctionUtils } from "../utils";
const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");
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

class ProcessGatherer extends Gatherer {
  private intervalId;
  private browser;
  private metrics: Array<PerformanceMetric> = new Array();

  async beforePass(passContext) {
    const driver = passContext.driver;
    let ws = await driver.wsEndpoint();
    this.browser = await PptrUtils.connect(ws);
    let hasBind = false;

    FunctionUtils.bindEvent(this.browser, "targetchanged", async target => {
      let page = await target.page();
      if (page) {
        if (hasBind) {
          return;
        }
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
        hasBind = true;
      }
    });

    this.intervalId = setInterval(async () => {
      await driver.evaluateAsync(`(function() {
                if (chrome.runtime && chrome.runtime.sendMessage) {
                    chrome.runtime.sendMessage("${EXTENSION_ID}", {});
                }
                return true;
            })()`);
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
