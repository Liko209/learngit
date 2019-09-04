/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { DebugGatherer } from ".";
import { SearchPage } from "../pages";
import { Config } from "../config";
import { FileService } from "../services";
import { globals } from '../globals';

class SearchGatherer extends DebugGatherer {
  private keywords: Array<string>;
  private metricKeys: Array<string> = [
    'search_group',
    'search_people',
    'search_team',
    'search_post',
    'ui_globalsearch_tab_render',
    'scroll_search_post'
  ];

  constructor() {
    super();

    this.keywords = Config.searchKeywords;
  }

  async _beforePass(passContext) {
    await this.disableCache(passContext);

    await this.gathererConsole(this.metricKeys, passContext);
  }

  async _pass(passContext) {
    let searchPage = new SearchPage(passContext);

    // pre loaded
    await this.search(searchPage, Config.sceneRepeatCount, passContext.driver);
  }

  async _afterPass(passContext) {
    let searchPage = new SearchPage(passContext);

    globals.startCollectProcessInfo();
    this.beginGathererConsole();

    let filePath = await FileService.trackingHeapObjects(passContext.driver);
    globals.pushMemoryFilePath(filePath);
    // switch conversation
    await this.search(searchPage, Config.sceneRepeatCount, passContext.driver);

    filePath = await FileService.trackingHeapObjects(passContext.driver);
    globals.pushMemoryFilePath(filePath);

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

  async search(page: SearchPage, searchCount: number = -1, driver) {
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
      this.clearTmpGatherer(this.metricKeys);

      keyword = this.keywords[index++ % this.keywords.length];
      await page.searchByKeyword(keyword);

      await page.enterSearchResult();

      await page.switchAllSeachTab();

      // await page.scrollMessageTab();

      await page.closeSearch();

      this.pushGatherer(this.metricKeys);
    }
  }
}

export { SearchGatherer };
