import 'testcafe';
import * as assert from 'assert';

import { BaseWebComponent } from '../BaseWebComponent';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';
import { SITE_URL } from '../../../config';
import { H } from '../../helpers';

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

  get spinners() {
    return this.getSelector('div[role="progressbar"]');
  }

  get pagePath() {
    return this.t.eval(() => window.location.pathname);
  }

  async reload() {
    await this.t.eval(() => location.reload(true));
  }

  async waitForAllSpinnersToDisappear(timeout: number = 30e3) {
    // this is an application-wide spinner waiter
    try {
      await H.retryUntilPass(async () => assert(await this.spinners.count > 0), 4);
    } catch (e) {
      // it's ok if spinner doesn't exist
    } finally {
      await this.t.expect(this.spinners.count).eql(0, { timeout });
    }
  }

  async openConversationByUrl(groupId: number | string) {
    const url = new URL(SITE_URL);
    const conversationUrl = `${url.protocol}//${url.hostname}/messages/${groupId}`;
    await this.t.navigateTo(conversationUrl);
  }
}
