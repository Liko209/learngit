/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { DebugGatherer } from ".";
import { ConversationPage } from "../pages";
import { Config } from "../config";
import { globals } from "../globals";

class SearchForShareGatherer extends DebugGatherer {
  private keywords: Array<string>;
  private conversationIds: { [key: string]: string };

  private metricKeys: Array<string> = [
    'search_all_group',
    'SEARCH_PERSONS_GROUPS'
  ];

  constructor() {
    super();

    this.keywords = Config.searchKeywords;
    this.conversationIds = Config.switchConversationIds;
  }

  async _beforePass(passContext) {
    await this.disableCache(passContext);

    await this.gathererConsole(this.metricKeys, passContext);
  }

  async _pass(passContext) {
    let conversationPage = new ConversationPage(passContext);

    // pre loaded
    await this.searchForShare(conversationPage, Config.sceneRepeatCount);
  }

  async _afterPass(passContext) {
    let conversationPage = new ConversationPage(passContext);

    globals.startCollectProcessInfo();
    this.beginGathererConsole();

    await this.searchForShare(conversationPage, Config.sceneRepeatCount);

    this.endGathererConsole();

    let result = {};
    let keys = Object.keys(this.consoleMetrics);
    for (let key of keys) {
      result[key] = {
        api: this.consoleMetrics[key],
        ui: []
      };
    }

    console.log(JSON.stringify(result));
    return result;
  }

  async searchForShare(page: ConversationPage, switchCount: number = -1) {
    if (switchCount <= 0) {
      switchCount = Config.sceneRepeatCount;
    }

    let imageConversationId = this.conversationIds['image'];
    if (!imageConversationId) {
      return;
    }

    await page.swichConversationById(imageConversationId, false);

    await page.openShareImageDialog();

    let keyword,
      index = 0;

    while (index < switchCount) {
      try {
        keyword = this.keywords[index++ % this.keywords.length];

        this.clearTmpGatherer(this.metricKeys);

        await page.searchForShare(keyword);

        this.pushGatherer(this.metricKeys);
      } catch (err) {
      }
    }

    await page.closeShareImageDialog();
  }
}

export { SearchForShareGatherer };
