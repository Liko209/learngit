/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { DebugGatherer } from ".";
import { PhonePage } from "../pages";
import { JupiterUtils } from "../utils";
import { Config } from "../config";
import * as bluebird from 'bluebird';

class CallLogGatherer extends DebugGatherer {
  private metricKeys: Array<string> = [
    "fetch_call_log",
    "fetch_call_log_from_db",
    // "clear_all_call_log",
    // "clear_all_call_log_from_server",
    "delete_call_log",
    "delete_call_log_from_server",
    "fetch_voicemails",
    "fetch_voicemails_from_db",
    // "clear_all_voicemails",
    // "clear_all_voicemails_from_server",
    "init_rc_message_badge",
    // "delete_rc_message",
    // "delete_rc_message_from_server",
    "filter_and_sort_call_log",
    "filter_and_sort_voicemail",
    "fetch_recent_call_logs",
    "init_rc_call_log_badge"
  ];

  constructor() {
    super();
  }

  async _beforePass(passContext) {
    await this.gathererConsole(this.metricKeys, passContext);
  }

  async _pass(passContext) {
    const driver = passContext.driver;
    const phonePage = new PhonePage(passContext);
    const { url } = passContext.settings;
    const browser = await phonePage.browser();

    this.beginGathererConsole();
    let authUrl, page, cnt, length;
    for (let i = 0; i < Config.sceneRepeatCount; i++) {
      try {
        cnt = 20;
        this.clearTmpGatherer(this.metricKeys);

        // length = this.tmpConsoleMetrics['delete_rc_message'].length;

        authUrl = await JupiterUtils.getAuthUrl(url, browser);

        page = await phonePage.newPage();

        await page.goto(authUrl);

        await phonePage.waitForCompleted();

        await phonePage.lookupRecentCallLog();

        await phonePage.createCallLog();

        await phonePage.deleteCallLog();

        await phonePage.enterVoiceMailTab();

        await phonePage.createVoiceMail();
        // await phonePage.deleteVoiceMail();

        // while (cnt-- > 0) {
        //   if (length >= this.tmpConsoleMetrics['delete_rc_message'].length) {
        //     await bluebird.delay(2000);
        //     continue;
        //   }

        //   break;
        // }

        this.pushGatherer(this.metricKeys);

        await phonePage.close();
        page = undefined;

        await driver.clearDataForOrigin(url);
      } catch (err) {
        this.logger.error(err);
        if (page) {
          await page.close();
        }
      }
    }
    this.endGathererConsole();
  }

  async _afterPass(passContext) {
    let result = {};
    for (let key of this.metricKeys) {
      result[key] = {
        api: this.consoleMetrics[key],
        ui: []
      };
    }

    return result;
  }
}

export { CallLogGatherer };
