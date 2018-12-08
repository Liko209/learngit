/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-09 13:22:02
 * Copyright © RingCentral. All rights reserved.
 */

// http://git.ringcentral.com:8888/Glip/glip-type-dictionary

const INTEGRATION_LOWER_ID = 7000;
const TYPE_ID_MASK = 0x1fff;
export default class GlipTypeUtil {
  static isIntegrationType(typeId: number): boolean {
    return typeId >= INTEGRATION_LOWER_ID;
  }
  static extractTypeId(objectId: number): number {
    return objectId & TYPE_ID_MASK; // eslint-disable-line no-bitwise
  }

  static convertToIdWithType(typeId: number, originalId: number) {
    return (Math.abs(originalId) & ~TYPE_ID_MASK) ^ typeId;
  }
}
