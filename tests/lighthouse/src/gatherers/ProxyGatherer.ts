/*
 * @Author: doyle.wu
 * @Date: 2018-12-25 14:37:09
 */

const Gatherer = require("lighthouse/lighthouse-core/gather/gatherers/gatherer");
import { mockHelper } from "../mock";
import { logUtils } from "../utils/LogUtils";

const logger = logUtils.getLogger(__filename);
class ProxyGatherer extends Gatherer {
  async beforePass(passContext) {}

  async afterPass(passContext) {
    // the mocker will effect lighthouse audit, so close mocker before audit.
    let start = Date.now();
    await mockHelper.close();
    logger.info("close mock finish. ", Date.now() - start, "ms");

    return {};
  }

  async pass(passContext) {}
}

export { ProxyGatherer };
