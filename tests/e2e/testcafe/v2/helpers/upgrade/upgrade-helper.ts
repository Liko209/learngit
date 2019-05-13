/*
 * @Author: doyle.wu
 * @Date: 2019-05-09 15:21:54
 */
import { UpgradeHook } from './upgrade-hook';

class UpgradeHelper {
  private upgradeHook = new UpgradeHook();

  constructor(private t: TestController) {
  }

  async setup(): Promise<void> {
    await this.upgradeHook.setup();

    await this.t.addRequestHooks(this.upgradeHook);
  }

  public upgrade() {
    this.upgradeHook.upgrade();
  }

  public downgrade() {
    this.upgradeHook.downgrade();
  }
}

export {
  UpgradeHelper
}
