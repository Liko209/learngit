/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-09 10:34:44
 * Copyright © RingCentral. All rights reserved.
 */
class BuildUtils {
  static isProductionBuild() {
    return process.env.JUPITER_ENV === 'production';
  }
  static isPublicBuild() {
    return process.env.JUPITER_ENV === 'public';
  }
}

export { BuildUtils };
