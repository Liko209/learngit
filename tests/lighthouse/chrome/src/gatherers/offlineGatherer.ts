/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
import { BaseGatherer } from ".";
import * as bluebird from "bluebird";

class OfflineGatherer extends BaseGatherer {
  async _beforePass(passContext) {
    await passContext.driver.goOffline();

    await bluebird.delay(20000);
  }

  async _afterPass(passContext) {
    return {};
  }

  async _pass(passContext) {}
}

export { OfflineGatherer };
