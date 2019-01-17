/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 10:11:03
 */
import { Page } from "./Page";
import * as bluebird from "bluebird";

class SearchPage extends Page {
  private input: string = "input.search-input";

  private textItem: string = 'div[data-test-automation-id="search-item-text"]';

  private logo: string = "header h1";

  async searchByKeyword(keyword: string) {
    let page = await this.page();
    await this.utils.click(page, this.input);

    await this.utils.waitForSelector(page, this.input);

    await this.utils.setText(page, this.input, keyword);

    await this.utils.waitForSelector(page, this.textItem);

    await this.utils.click(page, this.logo);

    await bluebird.delay(200);
  }
}

export { SearchPage };
