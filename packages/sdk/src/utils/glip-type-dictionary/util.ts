/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-09 13:22:02
 * Copyright © RingCentral. All rights reserved.
 */


// http://git.ringcentral.com:8888/Glip/glip-type-dictionary

const INTEGRATION_LOWER_ID = 7000;
export default class GlipTypeUtil {
  static isIntegrationType(typeId: number): boolean {
    return typeId >= INTEGRATION_LOWER_ID;
  }
  static extractTypeId(objectId: number): number {
    return objectId & 0x1fff; // eslint-disable-line no-bitwise
  }
}