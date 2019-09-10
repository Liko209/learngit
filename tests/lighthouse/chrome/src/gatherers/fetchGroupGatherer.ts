/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { DebugGatherer } from ".";
import { GroupPage } from "../pages";
import { JupiterUtils } from "../utils";
import { Config } from "../config";
import * as bluebird from 'bluebird';

class FetchGroupGatherer extends DebugGatherer {
  private metricKeys: Array<string> = [
    "group_section_fetch_teams",
    "group_section_fetch_favorites",
    "group_section_fetch_direct_messages"
  ];

  constructor() {
    super();
  }

  async _beforePass(passContext) {
    await this.gathererConsole(this.metricKeys, passContext);
  }

  async _pass(passContext) {
  }

  async _afterPass(passContext) {
    const driver = passContext.driver;
    let groupPage = new GroupPage(passContext);
    const { url } = passContext.settings;
    const browser = await groupPage.browser();

    this.beginGathererConsole();
    let authUrl, page, cnt, flag;
    let lengthMap = {};
    for (let i = 0; i < Config.sceneRepeatCount; i++) {
      try {
        cnt = 10;

        this.clearTmpGatherer(this.metricKeys);

        for (let k of this.metricKeys) {
          lengthMap[k] = this.tmpConsoleMetrics[k].length;
        }

        await driver.clearDataForOrigin(url);

        authUrl = await JupiterUtils.getAuthUrl(url, browser);

        page = await groupPage.newPage();

        await page.goto(authUrl);

        cnt = 10;
        while (cnt-- > 0) {
          flag = true;

          for (let k of this.metricKeys) {
            if (lengthMap[k] >= this.tmpConsoleMetrics[k].length) {
              flag = false;
              break;
            }
          }

          if (!flag) {
            await bluebird.delay(2000);
            continue;
          }

          break;
        }

        this.pushGatherer(this.metricKeys);

        await groupPage.close();
        page = undefined;
      } catch (err) {
        this.logger.error(err);
        if (page) {
          await page.close()
        }
      }
    }

    this.endGathererConsole()

    let result = {};
    for (let key of this.metricKeys) {
      result[key] = {
        api: this.consoleMetrics[key],
        ui: []
      };
    }
    return result;
  }
}

export { FetchGroupGatherer };
