/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-25 14:51:16
 * Copyright © RingCentral. All rights reserved.
 */
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
}

export { PlatformUtils };
