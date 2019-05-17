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
  private metricKeys: Array<string> = [
    'goto_conversation_fetch_posts',
    'goto_conversation_fetch_items',
    'conversation_fetch_from_db',
    // 'goto_conversation_shelf_fetch_items',
    // 'conversation_fetch_unread_post',
    // 'conversation_fetch_interval_post',
    // 'conversation_fetch_from_server',
    // 'conversation_handle_data_from_server',
  ];

  constructor(conversationIds: Array<string>) {
    super();

    this.conversationIds = conversationIds;
  }

  async _beforePass(passContext) {
    await this.gathererConsole(this.metricKeys, passContext);
  }

  async _pass(passContext) {
    let conversationPage = new ConversationPage(passContext);

    const driver = passContext.driver;
    // pre loaded
    await this.switchConversion(driver, conversationPage);
  }

  async _afterPass(passContext) {
    let conversationPage = new ConversationPage(passContext);

    const driver = passContext.driver;

    let filePath = await FileService.saveHeapIntoDisk(await PptrUtils.trackingHeapObjects(driver));
    globals.pushMemoryFilePath(filePath);

    await PptrUtils.collectGarbage(driver);
    await bluebird.delay(5000);

    globals.startCollectProcessInfo();
    this.beginGathererConsole();

    // switch conversation
    await this.switchConversion(driver, conversationPage, Config.sceneRepeatCount);

    this.endGathererConsole();
    await PptrUtils.collectGarbage(driver);
    await bluebird.delay(5000);

    globals.stopCollectProcessInfo();

    filePath = await FileService.saveHeapIntoDisk(await PptrUtils.trackingHeapObjects(driver));
    globals.pushMemoryFilePath(filePath);

    let result = {};
    for (let key of this.metricKeys) {
      result[key] = {
        api: this.consoleMetrics[key],
        ui: []
      };
    }

    return result;
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
