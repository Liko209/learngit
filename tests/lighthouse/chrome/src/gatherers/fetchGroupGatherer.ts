/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { BaseGatherer } from ".";
import { GroupPage } from "../pages";
import { JupiterUtils } from "../utils";
import { Config } from "../config";
import * as bluebird from 'bluebird';

class FetchGroupGatherer extends BaseGatherer {
  private artifacts: Map<string, Array<any>> = new Map();
  private metricKeys: Array<string> = [
    "group_section_fetch_teams",
    "group_section_fetch_favorites",
    "group_section_fetch_direct_messages"
  ];

  constructor() {
    super();
    for (let key of this.metricKeys) {
      this.artifacts.set(key, []);
    }
  }

  async _beforePass(passContext) { }

  async _pass(passContext) {
  }

  async _afterPass(passContext) {
    const driver = passContext.driver;
    let groupPage = new GroupPage(passContext);
    const { url } = passContext.settings;
    const browser = await groupPage.browser();

    let authUrl, page, item, cnt, flag;
    for (let i = 0; i < Config.sceneRepeatCount; i++) {
      try {
        cnt = 10;

        await driver.clearDataForOrigin(url);

        authUrl = await JupiterUtils.getAuthUrl(url, browser);

        page = await groupPage.newPage();

        await page.goto(authUrl);

        // while (cnt-- > 0 && !(await groupPage.waitForCompleted())) {
        //   await bluebird.delay(2000);
        // }

        cnt = 10;
        while (cnt-- > 0) {
          flag = true;

          let metric = await page.evaluate(() => {
            const m = performance["jupiter"];
            return m;
          });

          if (!metric) {
            await bluebird.delay(2000);
            continue;
          }

          for (let k of this.metricKeys) {
            if (!metric[k] || metric[k].length === 0) {
              flag = false;
              break;
            }
          }

          if (!flag) {
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
      } catch (err) {
        if (page) {
          await page.close()
        }
      }
    }

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

export { FetchGroupGatherer };
