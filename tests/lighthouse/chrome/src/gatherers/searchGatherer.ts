/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { BaseGatherer } from ".";
import { SearchPage } from "../pages";
import { Config } from "../config";

class SearchGatherer extends BaseGatherer {
  private keywords: Array<string>;

  constructor(keywords: Array<string>) {
    super();

    this.keywords = keywords;
  }

  async _beforePass(passContext) {}

  async _pass(passContext) {
    let searchPage = new SearchPage(passContext);

    // pre loaded
    await this.search(searchPage);

    // clear performance metrics of pre-loaded
    let page = await searchPage.page();
    await page.evaluate(() => {
      performance["jupiter"] = {};
    });
  }

  async _afterPass(passContext) {
    let searchPage = new SearchPage(passContext);

    // switch conversation
    await this.search(searchPage, Config.sceneRepeatCount);

    let page = await searchPage.page();

    let metrics = await page.evaluate(() => {
      return performance["jupiter"];
    });

    return {
      search_group: { api: metrics["search_group"], ui: [] },
      search_people: { api: metrics["search_people"], ui: [] },
      search_team: { api: metrics["search_team"], ui: [] }
    };
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
