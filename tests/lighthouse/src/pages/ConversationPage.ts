/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 10:11:03
 */
import { Page } from "./Page";

class ConversationPage extends Page {
  private progressbar: string =
    'div[data-test-automation-id="jui-stream-wrapper"] div[role="progressbar"]';

  private card: string =
    'div[data-test-automation-id="jui-stream"] section div[data-name="conversation-card"]';

  async swichConversationById(id: string) {
    let conversation = `li[data-group-id="${id}"]`;

    let page = await this.page();
    await this.utils.click(page, conversation);

    await this.utils.disappearForSelector(page, this.progressbar);

    await this.utils.waitForSelector(page, this.card);
  }
}

export { ConversationPage };
