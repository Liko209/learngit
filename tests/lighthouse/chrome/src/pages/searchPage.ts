/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 10:11:03
 */
import { Page } from "./page";
import * as bluebird from "bluebird";
import { PptrUtils } from '../utils';

class SearchPage extends Page {
  private input: string = "input.search-input";

  private textItem: string = 'div[data-test-automation-id="search-item-text"]';

  private logo: string = "header h1";

  async searchByKeyword(keyword: string) {
    let page = await this.page();
    await PptrUtils.click(page, this.input);

    await PptrUtils.waitForSelector(page, this.input);

    await PptrUtils.setText(page, this.input, keyword);

    await PptrUtils.waitForSelector(page, this.textItem);

    await PptrUtils.click(page, this.logo);

    await bluebird.delay(200);
  }
}

export { SearchPage };
