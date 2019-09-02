/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { DebugGatherer } from ".";
import { ConversationPage, HomePage } from "../pages";
import { FileService } from "../services";
import { PptrUtils } from "../utils";
import { Config } from "../config";
import { globals } from "../globals";
import * as bluebird from 'bluebird';

class SwitchConversationGatherer extends DebugGatherer {
  private conversationIds: { [key: string]: string };

  private metricKeys: Array<string> = [
    'goto_conversation_fetch_posts',
    'goto_conversation_fetch_items',
    'conversation_fetch_from_db',
    'goto_conversation_shelf_fetch_items',
    'ui_message_render',
    'ui_profile_render',
    'init_group_members',
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
    let page = await conversationPage.page();

    const driver = passContext.driver;
    // pre loaded
    await this.switchConversion(driver, conversationPage, Config.sceneRepeatCount);

    await bluebird.delay(2000);

    await page.setOfflineMode(true);

    await bluebird.delay(2000);
  }

  async _afterPass(passContext) {
    let conversationPage = new ConversationPage(passContext);

    const driver = passContext.driver;

    let filePath = await FileService.trackingHeapObjects(driver);
    globals.pushMemoryFilePath(filePath);

    await PptrUtils.collectGarbage(driver);
    await bluebird.delay(5000);

    globals.startCollectProcessInfo();
    this.beginGathererConsole();

    // switch conversation
    await this.switchConversion(driver, conversationPage, Config.sceneRepeatCount * Object.keys(this.conversationIds).length);

    this.endGathererConsole();
    await PptrUtils.collectGarbage(driver);
    await bluebird.delay(5000);

    filePath = await FileService.trackingHeapObjects(driver);
    globals.pushMemoryFilePath(filePath);

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

  async switchConversion(driver, page: ConversationPage, switchCount: number = -1) {
    const conversationTypes = Object.keys(this.conversationIds);

    let needGC = true;
    if (switchCount <= 0) {
      needGC = false;
      switchCount = conversationTypes.length;
    }

    let halfCount = switchCount / 2;

    let type, id, suffix, index = 0;
    while (index < switchCount) {
      try {
        this.clearTmpGatherer(this.metricKeys);

        type = conversationTypes[index++ % conversationTypes.length];

        suffix = type === 'mixed' ? '' : type;

        id = this.conversationIds[type];

        this.logger.info(`switch to ${id}`);

        await page.swichConversationById(id);

        await page.switchDetailTab();

        await page.lookupTeamMember();

        this.pushGatherer(this.metricKeys, suffix, this.metricKeys);

        await bluebird.delay(2000);

        if (needGC && index > halfCount) {
          globals.stopCollectProcessInfo();

          let filePath = await FileService.trackingHeapObjects(driver);
          globals.pushMemoryFilePath(filePath);

          await PptrUtils.collectGarbage(driver);

          needGC = false;

          filePath = await FileService.trackingHeapObjects(driver);
          globals.pushMemoryFilePath(filePath);

          await bluebird.delay(2000);

          globals.startCollectProcessInfo();
        }
      } catch (err) {
      }
    }
  }
}

export { SwitchConversationGatherer };
