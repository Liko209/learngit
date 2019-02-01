/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");
import { ConversationPage } from "../pages/ConversationPage";
import { logUtils } from "../utils/LogUtils";

class SwitchConversationGatherer extends Gatherer {
  private conversationIds: Array<string>;
  private logger = logUtils.getLogger(__filename);

  constructor(conversationIds: Array<string>) {
    super();

    this.conversationIds = conversationIds;
  }

  beforePass(passContext) {}

  async pass(passContext) {
    let conversationPage = new ConversationPage(passContext);

    // pre loaded
    await this.switchConversion(conversationPage);

    // clear performance metrics of pre-loaded
    let page = await conversationPage.page();
    await page.evaluate(() => {
      performance["jupiter"] = {};
    });

    // switch conversation
    await this.switchConversion(conversationPage, 40);
  }

  async afterPass(passContext) {
    let conversationPage = new ConversationPage(passContext);

    let page = await conversationPage.page();

    let metrics = await page.evaluate(() => {
      return performance["jupiter"];
    });

    return {
      switch_conversation: { api: metrics["switch_conversation"], ui: [] }
    };
  }

  async switchConversion(page: ConversationPage, switchCount: number = -1) {
    if (!this.conversationIds || this.conversationIds.length <= 1) {
      this.logger.warn("conversationIds size is less than 1, switch fail!");
      return;
    }

    if (switchCount <= 0) {
      switchCount = this.conversationIds.length;
    }

    let id,
      index = 0;
    while (index < switchCount) {
      id = this.conversationIds[index++ % this.conversationIds.length];
      await page.swichConversationById(id);
    }
  }
}

export { SwitchConversationGatherer };
