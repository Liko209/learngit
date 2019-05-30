/*
 * @Author: doyle.wu
 * @Date: 2019-05-24 14:07:46
 */
import { Page } from '.';
import { Selector } from 'testcafe';
import * as bluebird from 'bluebird';

class HomePage extends Page {
  private searchInput: Selector;

  private searchText: Selector;

  private searchClear: Selector;

  private searchClose: Selector;

  private conversationCard: Selector;
  private conversationPanel: Selector;

  constructor(t: TestController) {
    super(t);

    this.searchInput = Selector('div[data-test-automation-id="topBar-search-bar"]', this.selectorOpt);
    this.searchText = Selector('input[data-test-automation-id="global-search-input"]', this.selectorOpt);
    this.searchClear = Selector('span[data-test-automation-id="global-search-clear"]', this.selectorOpt);
    this.searchClose = Selector('span[data-test-automation-id="global-search-close"]', this.selectorOpt);

    this.conversationCard = Selector('div[data-test-automation-id="virtualized-list"] div div[data-name="conversation-card"]', this.selectorOpt);
    this.conversationPanel = Selector('div[data-test-automation-id="virtualized-list"]', this.selectorOpt);
  }

  async searchByKeyword(keyword: string): Promise<void> {
    await this.searchInput.exists;

    await this.t.click(this.searchInput);

    await this.t.typeText(this.searchText, keyword);

    await this.searchText.exists;

    await this.t.click(this.searchClear);

    await this.t.click(this.searchClose);

    await bluebird.delay(200);
  }

  async switchConversationById(id: string) {
    const conversation = Selector(`li[data-group-id="${id}"]`, this.selectorOpt);

    await conversation.exists;

    await this.t.click(conversation);

    await this.conversationCard.exists;

    await this.scrollBy('div[data-test-automation-id="virtualized-list"]', 0, -1000);

    await this.scrollBy('div[data-test-automation-id="virtualized-list"]', 0, -1000);

    await bluebird.delay(200);
  }
}

export {
  HomePage
}
