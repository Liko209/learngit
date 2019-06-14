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
  private metricKeys: Array<string> = [
    "handle_initial_incoming_account",
    "handle_initial_incoming_company",
    "handle_initial_incoming_item",
    "handle_initial_incoming_presence",
    "handle_initial_incoming_state",
    "handle_initial_incoming_profile",
    "handle_initial_incoming_person",
    "handle_initial_incoming_group",
    "handle_initial_incoming_post",
    "handle_remaining_incoming_account",
    "handle_remaining_incoming_company",
    "handle_remaining_incoming_item",
    "handle_remaining_incoming_presence",
    "handle_remaining_incoming_state",
    "handle_remaining_incoming_profile",
    "handle_remaining_incoming_person",
    "handle_remaining_incoming_group",
    "handle_remaining_incoming_post",
    "handle_index_incoming_account",
    "handle_index_incoming_company",
    "handle_index_incoming_item",
    "handle_index_incoming_presence",
    "handle_index_incoming_state",
    "handle_index_incoming_profile",
    "handle_index_incoming_person",
    "handle_index_incoming_group",
    "handle_index_incoming_post",
    "handle_index_data",
    "handle_remaining_data",
    "handle_initial_data",
  ];

  constructor() {
    super();
  }

  async _beforePass(passContext) {
    await this.gathererConsole(this.metricKeys, passContext);
  }

  async _pass(passContext) {
    const driver = passContext.driver;
    const groupPage = new GroupPage(passContext);
    const { url } = passContext.settings;
    const browser = await groupPage.browser();

    this.beginGathererConsole();
    let authUrl, page, cnt, length;
    for (let i = 0; i < Config.sceneRepeatCount; i++) {
      try {
        cnt = 20;

        length = this.consoleMetrics['handle_index_data'].length

        authUrl = await JupiterUtils.getAuthUrl(url, browser);

        page = await groupPage.newPage();

        await page.goto(authUrl);

        await groupPage.waitForCompleted();

        await bluebird.delay(5000);

        while (cnt-- > 0) {
          if (length >= this.consoleMetrics['handle_index_data'].length) {
            await bluebird.delay(2000);
            continue;
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
    this.endGathererConsole();
  }

  async _afterPass(passContext) {
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

export { IndexDataGatherer };
