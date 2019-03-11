/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");
import { SearchPage } from "../../pages";
import { LogUtils } from "../../utils";

class SearchGatherer extends Gatherer {
  private keywords: Array<string>;
  private logger = LogUtils.getLogger(__filename);

  constructor(keywords: Array<string>) {
    super();

    this.keywords = keywords;
  }

  beforePass(passContext) { }

  async pass(passContext) {
    let searchPage = new SearchPage({ passContext });

    // pre loaded
    await this.search(searchPage);

    // clear performance metrics of pre-loaded
    let page = await searchPage.page();
    await page.evaluate(() => {
      performance["jupiter"] = {};
    });

    // switch conversation
    await this.search(searchPage, 40);
  }

  async afterPass(passContext) {
    let searchPage = new SearchPage({ passContext });

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
