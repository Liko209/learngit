/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { DebugGatherer } from ".";
import { ConversationPage } from "../pages";
import { Config } from "../config";
import { globals } from "../globals";

class DocViewerGatherer extends DebugGatherer {
  private conversationIds: { [key: string]: string };
  
  private metricKeys: Array<string> = [
    'ui_viewer_page_render',
  ];

  constructor() {
    super();

    this.conversationIds = Config.switchConversationIds;
  }

  async _beforePass(passContext) {
    await this.disableCache(passContext);

    await this.gathererConsole(this.metricKeys, passContext);
  }

  async _pass(passContext) {
    let conversationPage = new ConversationPage(passContext);

    // pre loaded
    await this.viewDoc(conversationPage, Config.sceneRepeatCount);
  }

  async _afterPass(passContext) {
    let conversationPage = new ConversationPage(passContext);

    globals.startCollectProcessInfo();
    this.beginGathererConsole();

    await this.viewDoc(conversationPage, Config.sceneRepeatCount);

    this.endGathererConsole();

    let result = {};
    let keys = Object.keys(this.consoleMetrics);
    for (let key of keys) {
      result[key] = {
        api: this.consoleMetrics[key],
        ui: []
      };
    }

    return result;
  }

  async viewDoc(page: ConversationPage, switchCount: number = -1) {
    if (switchCount <= 0) {
      switchCount = Config.sceneRepeatCount;
    }

    let docConversationId = this.conversationIds['doc'];
    if (!docConversationId) {
      return;
    }

    await page.swichConversationById(docConversationId, false);

    let index = 0;
    while (index < switchCount) {
      index++;
      try {
        this.clearTmpGatherer(this.metricKeys);

        await page.clickDoc();

        this.pushGatherer(this.metricKeys);

        await page.closeDocView();
      } catch (err) {
      }
    }
  }
}

export { DocViewerGatherer };
