/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-25 14:51:16
 * Copyright © RingCentral. All rights reserved.
 */

import { Pal } from '../pal';
import { UAParser } from 'ua-parser-js';

class PlatformUtils {
  static isSafari() {
    const userAgent = navigator.userAgent;
    return (
      userAgent &&
      userAgent.indexOf('Safari') > -1 &&
      userAgent.indexOf('Chrome') < 1
    );
  }

  static isFireFox() {
    const userAgent = navigator.userAgent;
    return userAgent && userAgent.indexOf('Firefox') > -1;
  }

  static isElectron() {
    return navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
  }

  static getRCUserAgent() {
    const RC_JUPITER = 'RingCentral Jupiter';
    let userAgent = '';
    const { appVersion = '' } = Pal.instance.getApplicationInfo() || {};
    const uaParser = new UAParser(navigator.userAgent);
    const jupiterElectron = window['jupiterElectron'];
    if (jupiterElectron) {
      const {
        electronVersion,
        electronAppVersion,
      } = jupiterElectron.getElectronVersionInfo();
      userAgent = `${RC_JUPITER} DT/${appVersion}-${
        electronAppVersion.split(' ')[0]
      }/Electron-${electronVersion}`;
    } else {
      const { name, version } = uaParser.getBrowser();
      userAgent = `${RC_JUPITER} Web/${appVersion}/${name}-${version}`;
    }

    return userAgent;
  }
}

export { PlatformUtils };
