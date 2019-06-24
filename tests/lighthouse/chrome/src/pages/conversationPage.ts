/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 10:11:03
 */
import { Page } from "./page";
import * as bluebird from "bluebird";
import { PptrUtils } from '../utils';

class ConversationPage extends Page {
  private progressbar: string =
    'div[data-test-automation-id="jui-stream-wrapper"] div[role="progressbar"]';

  private card: string =
    'div[data-test-automation-id="virtualized-list"] div div[data-name="conversation-card"]';

  private panel = 'div[data-test-automation-id="virtualized-list"]';

  async swichConversationById(id: string) {
    let conversation = `li[data-group-id="${id}"]`;

    let page = await this.page();
    await PptrUtils.click(page, conversation);

    await PptrUtils.disappearForSelector(page, this.progressbar);

    await PptrUtils.waitForSelector(page, this.card);

    await PptrUtils.scrollBy(page, this.panel, 0, -1000);
    await PptrUtils.scrollBy(page, this.panel, 0, -1000);

    await bluebird.delay(200);
  }

  async switchDetailTab() {
    let page = await this.page();

    await PptrUtils.click(page, 'button[data-test-automation-id="right-shelf-files"]');
    await bluebird.delay(200);

    await PptrUtils.click(page, 'button[data-test-automation-id="right-shelf-images"]');
    await bluebird.delay(200);
  }

  async lookupTeamMember() {
    let page = await this.page();

    await PptrUtils.click(page, 'button[data-test-automation-id="memberButton"]');

    await PptrUtils.waitForSelector(page, 'div[data-test-automation-id="virtualized-list"] li');

    await PptrUtils.click(page, 'div[data-test-automation-id="profileDialogTitle"] button[aria-label="Close"]');

    await bluebird.delay(200);
  }
}

export { ConversationPage };
