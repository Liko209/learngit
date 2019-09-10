/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 10:11:03
 */
import { Page } from "./page";
import * as bluebird from "bluebird";
import { PptrUtils } from '../utils';

class SearchPage extends Page {
  private globalSearchResult = 'li[data-test-automation-id="search-content-item"]';

  private globalSearchBar = 'div[data-test-automation-id="topBar-search-bar"]';

  private input: string = 'input[data-test-automation-id="global-search-input"]';

  private textItem: string = 'div[data-test-automation-id="search-item-text"]';

  private clear: string = 'span[data-test-automation-id="search-input-clear"]';

  private closeBtn: string = 'span[data-test-automation-id="global-search-close"]';

  async searchByKeyword(keyword: string) {
    let page = await this.page();

    await PptrUtils.click(page, this.globalSearchBar);

    await PptrUtils.waitForSelector(page, this.input);

    await PptrUtils.type(page, this.input, keyword);

    await PptrUtils.waitForSelector(page, this.textItem);
  }

  async enterSearchResult() {
    let page = await this.page();

    await PptrUtils.click(page, this.globalSearchResult);
  }

  async switchAllSeachTab() {
    let page = await this.page();

    await PptrUtils.click(page, 'button[data-test-automation-id="globalSearch-people"]');
    await PptrUtils.waitForSelector(page, 'div[data-test-automation-id="global-full-search"] li[data-test-automation-id="searchResultsCount"]');
    await bluebird.delay(200);

    await PptrUtils.click(page, 'button[data-test-automation-id="globalSearch-groups"]');
    await PptrUtils.waitForSelector(page, 'div[data-test-automation-id="global-full-search"] li[data-test-automation-id="searchResultsCount"]');
    await bluebird.delay(200);

    await PptrUtils.click(page, 'button[data-test-automation-id="globalSearch-team"]');
    await PptrUtils.waitForSelector(page, 'div[data-test-automation-id="global-full-search"] li[data-test-automation-id="searchResultsCount"]');
    await bluebird.delay(200);

    // await PptrUtils.click(page, 'button[data-test-automation-id="globalSearch-messages"]');
    // await PptrUtils.waitForSelector(page, 'div[data-test-automation-id="search-message-panel"] li[data-test-automation-id="searchResultsCount"]');
    // await bluebird.delay(200);
  }

  async scrollMessageTab() {
    let page = await this.page();

    let list = 'div[data-test-automation-id="search-message-panel"] div[data-test-automation-id="virtualized-list"]';

    await PptrUtils.waitForSelector(page, list);

    await PptrUtils.scrollBy(page, list, 0, 1000);

    await bluebird.delay(200);

    await PptrUtils.scrollBy(page, list, 0, 1000);

    await bluebird.delay(200);
  }

  async closeSearch() {
    let page = await this.page();

    await PptrUtils.click(page, this.clear);

    await PptrUtils.click(page, this.closeBtn);

    await bluebird.delay(200);
  }
}

export { SearchPage };
