/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");
import { GroupPage } from "../pages";
import { Config } from "../config";
import * as bluebird from 'bluebird';

class FetchGroupGatherer extends Gatherer {
  private artifacts: Map<string, Array<any>> = new Map();
  private metricKeys: Array<string> = [
    "group_section_fetch_teams",
    "group_section_fetch_favorites",
    // "group_section_fetch_direct_messages"
  ];

  constructor() {
    super();
    for (let key of this.metricKeys) {
      this.artifacts.set(key, []);
    }
  }

  beforePass(passContext) { }

  async pass(passContext) {
  }

  async afterPass(passContext) {
    let groupPage = new GroupPage(passContext);

    let page = await groupPage.page();
    let item, cnt, flag;
    for (let i = 0; i < Config.sceneRepeatCount; i++) {
      try {
        cnt = 10;

        await page.reload({ waitUntil: "load" });

        while (cnt-- > 0 && !(await groupPage.waitForCompleted())) {
          await bluebird.delay(2000);
        }

        cnt = 10;
        while (cnt-- > 0) {
          flag = true;

          let metric = await page.evaluate(() => {
            const m = performance["jupiter"];
            return m;
          });

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
      } catch (err) { }
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
