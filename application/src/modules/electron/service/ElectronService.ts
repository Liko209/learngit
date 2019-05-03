/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-14 18:26:57
 * Copyright © RingCentral. All rights reserved.
 */

class ElectronService {
  constructor() {
    if (!window.jupiterElectron) {
      throw new Error(
        'Can not instantiate ElectronService in non-electron environment',
      );
    }
  }

  setBadgeCount(count: number) {
    window.jupiterElectron.setBadgeCount &&
      window.jupiterElectron.setBadgeCount(count || 0);
  }

  bringAppToFront() {
    const bringAppToFront = window.jupiterElectron.bringAppToFront;
    bringAppToFront && bringAppToFront();
  }
}

export { ElectronService };
