/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-02 19:25:53
 * Copyright © RingCentral. All rights reserved.
 */
class AnalysisBaseController {
  private _isProduction: boolean = false;
  constructor() {}

  getEndPoint() {
    let result = 'others';
    if (!window['jupiterElectron']) {
      result = 'web';
    } else {
      const platform = navigator.platform;
      if (platform.startsWith('Mac')) {
        result = 'mac';
      } else if (platform.startsWith('Win32')) {
        result = 'win32';
      } else if (platform.startsWith('Win64')) {
        result = 'win64';
      }
    }
    return result;
  }

  public setProduction(isProduction: boolean) {
    this._isProduction = isProduction;
  }

  public isProduction() {
    return this._isProduction;
  }
}

export { AnalysisBaseController };
