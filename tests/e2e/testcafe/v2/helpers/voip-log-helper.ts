import 'testcafe';
import { H } from './utils';
import * as _ from 'lodash';
import * as assert from 'assert';

export class BrowserConsoleHelper {
  constructor(private t: TestController) {
  }

  async isConsoleLogIncludesText(text: string, type?: string) {
    const logs: any = await this.t.getBrowserConsoleMessages();
    if (type) {
      if (_.includes(logs[type], text)) return true;
    } else {
      for (const key in logs) {
        if (_.includes(logs[key], text)) return true;
      }
    }
    return false;
  }

  async checkConsoleLogIncludesText(text: string, type?: string) {
    await H.retryUntilPass(async () => {
      const result = await this.isConsoleLogIncludesText(text, type);
      assert.ok(result, `console log ${type || ""} does not includes: ${text}`);
    })
  }

  /**
   * @action string in Array [`answer`,`reject`,`ignore`,`sendToVoicemail`,
   * `startReply`,`replyWithMessage`,`replyWithPattern`,`hangup`,
   * `flip`,`startRecord`,`stopRecord`,`hold`,`unhold`,`mute`,
   * `unmute`,`park`,`transfer`,`forward`,`dtmf`]
   */
  voipReg(action = ".*"): RegExp {
    return new RegExp(`TELEPHONY.*the ${action} of VoIP is called`);
  }

  async voiplogs(): Promise<string[]> {
    const consoleLogs = await this.t.getBrowserConsoleMessages()
    const info = consoleLogs.info
    return info.filter(item => this.voipReg().test(item))
  }

  async voipActionShouldBeCalled(action: string) {
    await H.retryUntilPass(async () => {
      const logs = await this.voiplogs()
      const isIncludes = _.findIndex(logs, (item) => this.voipReg(action).test(item)) > -1;
      assert(isIncludes, `${action} no exist`);
    });
  }

  async voipActionsInOrder(actions: string[]) {
    await H.retryUntilPass(async () => {
      const logs = await this.voiplogs();
      let cursorIndex = 0;
      for (let i = 0; i < actions.length; i++) {
        const currentIndex = _.findIndex(logs, (item) => this.voipReg(actions[i]).test(item), cursorIndex);
        assert(currentIndex >= cursorIndex, `actions[${i}] ${actions[i]} in wrong order`);
        cursorIndex = currentIndex
      }
    });
  }

}