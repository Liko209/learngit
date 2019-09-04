/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { DebugGatherer } from ".";
import { ConversationPage } from "../pages";
import { Config } from "../config";
import { globals } from "../globals";

class ImageViewerGatherer extends DebugGatherer {
  private conversationIds: { [key: string]: string };

  private metricKeys: Array<string> = [
    'ui_image_viewer_page_render',
    'ui_image_viewer_image_render'
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
    await this.viewImage(conversationPage, Config.sceneRepeatCount);
  }

  async _afterPass(passContext) {
    let conversationPage = new ConversationPage(passContext);

    globals.startCollectProcessInfo();
    this.beginGathererConsole();

    await this.viewImage(conversationPage, Config.sceneRepeatCount);

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

  async viewImage(page: ConversationPage, switchCount: number = -1) {
    if (switchCount <= 0) {
      switchCount = Config.sceneRepeatCount;
    }

    let imageConversationId = this.conversationIds['image'];
    if (!imageConversationId) {
      return;
    }

    await page.swichConversationById(imageConversationId, false);

    let index = 0;
    while (index < switchCount) {
      index++;
      try {
        this.clearTmpGatherer(this.metricKeys);

        await page.clickImage();

        this.pushGatherer(this.metricKeys);

        await page.closeImageView();
      } catch (err) {
      }
    }
  }
}

export { ImageViewerGatherer };
