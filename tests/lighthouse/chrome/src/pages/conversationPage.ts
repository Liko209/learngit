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
    'div[data-test-automation-id="jui-stream"] section div[data-name="conversation-card"]';

  private panel = 'div[data-test-automation-id="jui-stream-wrapper"] > div';

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
}

export { ConversationPage };
