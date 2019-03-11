/*
 * @Author: doyle.wu
 * @Date: 2018-12-12 12:56:30
 */
const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");
import * as bluebird from "bluebird";

class OfflineGatherer extends Gatherer {
  async beforePass(passContext) {
    await passContext.driver.goOffline();

    await bluebird.delay(20000);
  }

  afterPass(passContext) {
    return {};
  }

  pass(passContext) {}
}

export { OfflineGatherer };
