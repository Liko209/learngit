/*
 * @Author: isaac.liu
 * @Date: 2019-07-12 09:26:33
 * Copyright © RingCentral. All rights reserved.
 */
import { UIGlobalConfig } from '@/modules/common/UIGlobalConfig';

class LeftNavConfig extends UIGlobalConfig {
  static moduleName = `${UIGlobalConfig.moduleName}.leftnav`;

  static setExpanded(status: boolean) {
    this.put('expanded', status);
  }
  static expanded() {
    return this.get('expanded');
  }
}

export { LeftNavConfig };
