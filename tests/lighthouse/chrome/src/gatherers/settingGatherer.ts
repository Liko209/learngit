/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { DebugGatherer } from ".";
import { SettingPage } from "../pages";
import { Config } from "../config";
import { PptrUtils } from "../utils";
import { FileService } from "../services";
import { globals } from '../globals';

class SettingGatherer extends DebugGatherer {
  private metricKeys: Array<string> = [
    'ui_setting_page_render',
  ];

  constructor() {
    super();
  }

  async _beforePass(passContext) {
    await this.gathererConsole(this.metricKeys, passContext);
  }

  async _pass(passContext) {
    // pre loaded
    await this.switchSettingTab(new SettingPage(passContext), Config.sceneRepeatCount);
  }

  async _afterPass(passContext) {
    this.beginGathererConsole();

    let filePath = await FileService.trackingHeapObjects(passContext.driver);
    globals.pushMemoryFilePath(filePath);
    // switch conversation
    await this.switchSettingTab(new SettingPage(passContext), Config.sceneRepeatCount);

    filePath = await FileService.trackingHeapObjects(passContext.driver);
    globals.pushMemoryFilePath(filePath);

    this.endGathererConsole();

    let result = {};
    for (let key of this.metricKeys) {
      result[key] = {
        api: this.consoleMetrics[key],
        ui: []
      };
    }

    return result;
  }

  async switchSettingTab(page: SettingPage, searchCount: number = -1) {
    if (searchCount <= 0) {
      searchCount = Config.sceneRepeatCount;
    }

    let index = 0;
    await page.enterSettingPage();
    while (index++ < searchCount) {
      await page.enterGeneral();

      this.clearTmpGatherer(this.metricKeys);

      await page.enterNotifications();

      this.pushGatherer(this.metricKeys);
    }
  }
}

export { SettingGatherer };
