/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-14 18:26:57
 * Copyright © RingCentral. All rights reserved.
 */

class ElectronService {
  constructor() {
    if (!window.jupiterElectron || !window.jupiterElectron.setBadgeCount) {
      throw new Error(
        'Can not instantiate ElectronService in non-electron environment',
      );
    }
  }

  setBadgeCount(count: number) {
    window.jupiterElectron.setBadgeCount(count || 0);
  }
}

export { ElectronService };
