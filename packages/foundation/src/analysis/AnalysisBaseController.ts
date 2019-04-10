/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-02 19:25:53
 * Copyright © RingCentral. All rights reserved.
 */

import { BuildUtils } from '../utils/BuildUtils';

class AnalysisBaseController {
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

  public isProductionBuild() {
    return BuildUtils.isProductionBuild() || BuildUtils.isPublicBuild();
  }
}

export { AnalysisBaseController };
