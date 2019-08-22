import 'testcafe';
import { ClientFunction } from 'testcafe';
import * as assert from 'assert';

import { H } from '../../helpers';
import { BaseWebComponent } from '../BaseWebComponent';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';
import { SITE_URL } from '../../../config';
import { UpgradeDialog } from './UpgradeDialog';

export class AppRoot extends BaseWebComponent {
  async ensureLoaded() { }

  get self() {
    return null;
  }

  get loginPage() {
    return this.getComponent(LoginPage);
  }

  get homePage() {
    return this.getComponent(HomePage);
  }

  get pagePath() {
    return this.t.eval(() => window.location.pathname);
  }

  async reload() {
    await this.t.eval(() => location.reload(true));
  }

  async openConversationByUrl(groupId: number | string) {
    const url = new URL(SITE_URL);
    const conversationUrl = `${url.origin}/messages/${groupId}`;
    await this.t.navigateTo(conversationUrl);
  }

  get upgradeDialog() {
    return this.getComponent(UpgradeDialog);
  }


  async waitForPhoneState(state: string) {
    const getSipState = ClientFunction(() => window['sipState']);
    await H.retryUntilPass(async () => {
      const sipState = await getSipState();
      assert.equal(sipState, state);
    })
  }

  async waitForPhoneReady() {
    await this.waitForPhoneState('Registered');
  }

}
