/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { BaseGatherer } from ".";
import { ConversationPage } from "../pages";
import { FileService } from "../services";
import { PptrUtils } from "../utils";
import { Config } from "../config";
import { globals } from "../globals";
import * as bluebird from 'bluebird';

class SwitchConversationGatherer extends BaseGatherer {
  private conversationIds: Array<string>;

  constructor(conversationIds: Array<string>) {
    super();

    this.conversationIds = conversationIds;
  }

  async _beforePass(passContext) {
  }

  async _pass(passContext) {
    let conversationPage = new ConversationPage(passContext);

    const driver = passContext.driver;
    // pre loaded
    await this.switchConversion(driver, conversationPage);

    // clear performance metrics of pre-loaded
    let page = await conversationPage.page();
    await page.evaluate(() => {
      performance["jupiter"] = {};
    });
  }

  async _afterPass(passContext) {
    let conversationPage = new ConversationPage(passContext);

    const driver = passContext.driver;

    let filePath = await FileService.saveHeapIntoDisk(await PptrUtils.trackingHeapObjects(driver));
    globals.pushMemoryFilePath(filePath);

    await PptrUtils.collectGarbage(driver);
    await bluebird.delay(5000);

    globals.startCollectProcessInfo();

    // switch conversation
    await this.switchConversion(driver, conversationPage, Config.sceneRepeatCount);

    await PptrUtils.collectGarbage(driver);
    await bluebird.delay(5000);

    globals.stopCollectProcessInfo();

    filePath = await FileService.saveHeapIntoDisk(await PptrUtils.trackingHeapObjects(driver));
    globals.pushMemoryFilePath(filePath);

    let page = await conversationPage.page();

    let metrics = await page.evaluate(() => {
      return performance["jupiter"];
    });

    return {
      goto_conversation_fetch_items: { api: metrics["goto_conversation_fetch_items"], ui: [] },
      goto_conversation_fetch_posts: { api: metrics["goto_conversation_fetch_posts"], ui: [] },
      conversation_fetch_from_db: { api: metrics["conversation_fetch_from_db"], ui: [] }
    };
  }

  async switchConversion(driver, page: ConversationPage, switchCount: number = -1) {
    if (!this.conversationIds || this.conversationIds.length <= 1) {
      this.logger.warn("conversationIds size is less than 1, switch fail!");
      return;
    }

    let needGC = true;
    if (switchCount <= 0) {
      needGC = false;
      switchCount = this.conversationIds.length;
    }

    let halfCount = switchCount / 2;

    let id, index = 0;
    while (index < switchCount) {
      id = this.conversationIds[index++ % this.conversationIds.length];
      this.logger.info(`switch to ${id}`);
      await page.swichConversationById(id);

      if (needGC && index > halfCount) {
        globals.stopCollectProcessInfo();

        let filePath = await FileService.saveHeapIntoDisk(await PptrUtils.trackingHeapObjects(driver));
        globals.pushMemoryFilePath(filePath);

        await PptrUtils.collectGarbage(driver);

        needGC = false;

        filePath = await FileService.saveHeapIntoDisk(await PptrUtils.trackingHeapObjects(driver));
        globals.pushMemoryFilePath(filePath);

        await bluebird.delay(2000);

        globals.startCollectProcessInfo();
      }
    }
  }
}

export { SwitchConversationGatherer };
