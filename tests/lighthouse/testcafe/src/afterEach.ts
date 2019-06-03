/*
 * @Author: doyle.wu
 * @Date: 2019-05-21 16:50:43
 */
import { h, Globals } from '.';
import { CaseFlags } from './models';
import { execActions } from './actions';

const teardownCase = (flag: CaseFlags) => {
  return async (t: TestController) => {
    Globals.endTime = new Date();

    const mockClient = h(t).getMockClick();
    if (mockClient['requestId']) {
      await mockClient.releaseBrowser(mockClient['requestId']);
    }

    if (!Globals.skipTest) {
      if (!(await execActions("after", flag, t))) {
        throw new Error("after action exec error!");
      }
    }
  }
}

export {
  teardownCase
}
