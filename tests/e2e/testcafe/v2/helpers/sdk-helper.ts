import 'testcafe';
import { SdkManager } from "../sdk/manager";

class SdkHelper {

  constructor(
    private t: TestController,
  ) { }

  set sdkManager(sdkManager: SdkManager) {
    this.t.ctx.__sdkManager = sdkManager;
  }

  get sdkManager(): SdkManager {
    return this.t.ctx.__sdkManager;
  }

  async setup(key: string, secret: string, platformUrl: string, glipUrl: string) {
    this.sdkManager = new SdkManager(key, secret, platformUrl, glipUrl);
  }

}

export { SdkHelper };
