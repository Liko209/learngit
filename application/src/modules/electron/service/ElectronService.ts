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
  openWindow = (link: string) => {
    window.jupiterElectron && window.jupiterElectron.openWindow({ url: link });
  };

  setBadgeCount(count: number) {
    window.jupiterElectron.setBadgeCount &&
      window.jupiterElectron.setBadgeCount(count || 0);
  }

  bringAppToFront() {
    const bringAppToFront = window.jupiterElectron.bringAppToFront;
    bringAppToFront && bringAppToFront();
  }
  async isURLSchemeBound(url: string) {
    const isURLSchemeBound = window.jupiterElectron.isSchemeBound;
    return !isURLSchemeBound || isURLSchemeBound(url);
  }
}

export { ElectronService };
