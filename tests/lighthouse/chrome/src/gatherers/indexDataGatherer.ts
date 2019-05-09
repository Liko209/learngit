/*
 * @Author: doyle.wu
 * @Date: 2019-04-19 17:04:24
 */

import { BaseGatherer } from ".";
import { GroupPage } from "../pages";
import { JupiterUtils } from "../utils";
import { Config } from "../config";
import * as bluebird from 'bluebird';

class IndexDataGatherer extends BaseGatherer {
  private artifacts: Map<string, Array<any>> = new Map();
  private metricKeys: Array<string> = [
    "handle_incoming_account",
    "handle_incoming_company",
    "handle_incoming_item",
    "handle_incoming_presence",
    "handle_incoming_state",
    "handle_incoming_profile",
    "handle_incoming_person",
    "handle_incoming_group",
    "handle_incoming_post",
    "handle_index_data",
    "handle_remaining_data",
    "handle_initial_data",
  ];

  constructor() {
    super();
    for (let key of this.metricKeys) {
      this.artifacts.set(key, []);
    }
  }

  async _beforePass(passContext) { }

  async _pass(passContext) {
    const driver = passContext.driver;
    const groupPage = new GroupPage(passContext);
    const { url } = passContext.settings;
    const browser = await groupPage.browser();

    let authUrl, page, metric, cnt, item;
    for (let i = 0; i < Config.sceneRepeatCount; i++) {
      try {
        cnt = 20;

        authUrl = await JupiterUtils.getAuthUrl(url, browser);

        page = await groupPage.newPage();

        await page.goto(authUrl);

        await groupPage.waitForCompleted();

        await bluebird.delay(5000);

        while (cnt-- > 0) {
          metric = await page.evaluate(() => {
            const m = performance["jupiter"];
            return m;
          });

          if (!metric['handle_index_data']) {
            await bluebird.delay(2000);
            continue;
          }

          for (let k of this.metricKeys) {
            if (metric[k] && metric[k].length > 0) {
              item = metric[k].reduce((a, b) => { return (a.endTime - a.startTime) > (b.endTime - b.startTime) ? a : b });
              this.artifacts.get(k).push(item);
            }
          }
          break;
        }

        await groupPage.close();
        page = undefined;

        await driver.clearDataForOrigin(url);
      } catch (err) {
        if (page) {
          await page.close()
        }
      }
    }
  }

  async _afterPass(passContext) {
    let result = {};
    for (let key of this.metricKeys) {
      result[key] = {
        api: this.artifacts.get(key),
        ui: []
      };
    }
    return result;
  }
}

export { IndexDataGatherer };
