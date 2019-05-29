/*
 * @Author: doyle.wu
 * @Date: 2019-05-27 17:17:22
 */
import { h, Config, Globals } from "..";
import { LogUtils } from "../utils";

const logger = LogUtils.getLogger(__filename);

const checkEnv = async (t: TestController): Promise<boolean> => {
  const versionInfo = h(t).getVersion(Config.jupiterHost);
  const isReleaseRun = Config.jupiterHost === Config.jupiterReleaseHost;
  if (!isReleaseRun) {
    if (Config.jupiterHost === Config.jupiterStageHost) {
      const developVersion = h(t).getVersion(Config.jupiterDevelopHost);
      if (versionInfo.jupiterVersion === developVersion.jupiterVersion) {
        Globals.skipTest = true;
        logger.info(`stage[${versionInfo.jupiterVersion}] has released, so skip`);
        return false;
      }
    }
  }
  return true;
}

export {
  checkEnv
}
