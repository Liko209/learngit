/*
 * @Author: doyle.wu
 * @Date: 2019-01-11 10:11:03
 */
import { Page } from "./page";
import { PptrUtils } from '../utils';

class SettingPage extends Page {

  async enterSettingPage() {
    let page = await this.page();

    await PptrUtils.click(page, 'div[data-test-automation-id="settings"]');

    await PptrUtils.waitForSelector(page, 'div[data-test-automation-id="entry-notificationAndSounds"]');
  }

  async enterNotifications() {
    let page = await this.page();

    await PptrUtils.click(page, 'div[data-test-automation-id="entry-notificationAndSounds"]');

    await PptrUtils.waitForSelector(page, 'div[data-test-automation-id="settingItem-notificationBrowser"]');
  }

  async enterGeneral() {
    let page = await this.page();

    await PptrUtils.click(page, 'div[data-test-automation-id="entry-general"]');

    await PptrUtils.waitForSelector(page, 'div[data-test-automation-id="settingPage-general"]');
  }
}

export { SettingPage };
