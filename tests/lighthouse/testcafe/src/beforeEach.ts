/*
 * @Author: doyle.wu
 * @Date: 2019-05-21 16:50:25
 */
import { MockClientHook } from './mock';
import { BrowserInitDto } from 'mock-client';
import { LogUtils } from './utils';
import { Config, h, Globals } from '.';
import { CaseFlags } from './models';
import { execActions } from './actions';

const logger = LogUtils.getLogger(__filename);

const setupCase = (flag: CaseFlags) => {
  return async (t: TestController) => {
    if (Config.mockSwitch) {
      const mockClient = h(t).getMockClick();
      const requestId = await mockClient.registerBrowser(new BrowserInitDto()
        .appKey(Config.jupiterAppKey)
        .appSecret(Config.jupiterAppSecret)
        .env(Config.jupiterEnv)
        .useInitialCache(Config.useInitialCache)
        .record(false)
        .replay(true)
      );
      mockClient['requestId'] = requestId;

      await t.addRequestHooks(new MockClientHook(requestId));

      logger.info(`mock requestId : ${requestId}`);
    }

    await h(t).getBrowser().maximizeWindow();

    Globals.startTime = new Date();
    if (!Globals.skipTest) {
      if (!(await execActions("before", flag, t))) {
        throw new Error("before action exec error!");
      }
    }
  }
}

export {
  setupCase
}
