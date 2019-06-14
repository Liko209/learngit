/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { BaseGatherer } from ".";
import { SearchPage } from "../pages";
import { Config } from "../config";

class SearchGatherer extends BaseGatherer {
  private keywords: Array<string>;
  private metricKeys: Array<string> = [
    'search_group',
    'search_people',
    'search_team'
  ];

  constructor(keywords: Array<string>) {
    super();

    this.keywords = keywords;
  }

  async _beforePass(passContext) {
    await this.gathererConsole(this.metricKeys, passContext);
  }

  async _pass(passContext) {
    let searchPage = new SearchPage(passContext);

    // pre loaded
    await this.search(searchPage);
  }

  async _afterPass(passContext) {
    let searchPage = new SearchPage(passContext);

    this.beginGathererConsole();

    // switch conversation
    await this.search(searchPage, Config.sceneRepeatCount);

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

  async search(page: SearchPage, searchCount: number = -1) {
    if (!this.keywords || this.keywords.length <= 1) {
      this.logger.warn("keywords size is less than 1, switch fail!");
      return;
    }

    if (searchCount <= 0) {
      searchCount = this.keywords.length;
    }

    let keyword,
      index = 0;
    while (index < searchCount) {
      keyword = this.keywords[index++ % this.keywords.length];
      await page.searchByKeyword(keyword);
    }
  }
}

export { SearchGatherer };
