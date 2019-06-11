/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { BaseGatherer } from ".";
import { DialerPage } from "../pages";
import { Config } from "../config";

class SearchPhoneGatherer extends BaseGatherer {
  private keywords: Array<string>;
  private metricKeys: Array<string> = [
    'search_phone_number',
  ];

  constructor(keywords: Array<string>) {
    super();

    this.keywords = keywords;
  }

  async _beforePass(passContext) {
    await this.gathererConsole(this.metricKeys, passContext);
  }

  async _pass(passContext) {
    let dialerPage = new DialerPage(passContext);

    // pre loaded
    await this.search(dialerPage);
  }

  async _afterPass(passContext) {
    let dialerPage = new DialerPage(passContext);

    this.beginGathererConsole();

    // switch conversation
    await this.search(dialerPage, Config.sceneRepeatCount);

    this.endGathererConsole();

    let result = {};
    for (let key of this.metricKeys) {
      result[key] = {
        api: this.consoleMetrics[key],
        ui: []
      };
    }

    return result;
  }

  async search(page: DialerPage, searchCount: number = -1) {
    if (!this.keywords || this.keywords.length <= 1) {
      this.logger.warn("keywords size is less than 1, switch fail!");
      return;
    }

    await page.waitForCompleted();

    await page.openDialer();

    if (searchCount <= 0) {
      searchCount = this.keywords.length;
    }

    let keyword,
      index = 0;
    while (index < searchCount) {
      keyword = this.keywords[index++ % this.keywords.length];
      await page.searchByPhone(keyword);
    }

    await page.closeDialer();
  }
}

export { SearchPhoneGatherer };
