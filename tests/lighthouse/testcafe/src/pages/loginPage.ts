/*
 * @Author: doyle.wu
 * @Date: 2019-05-24 14:07:46
 */
import { Page } from '.';
import { Selector } from 'testcafe';

class LoginPage extends Page {
  private versionSelector = Selector(`#root > div:nth-child(2) > div > div:nth-child(1)`);

  async ensureLoaded() {
    await this.waitUntilExist(this.versionSelector);
  }

  async version(): Promise<string> {
    return await this.versionSelector.innerText;
  }
}

export {
  LoginPage
}
