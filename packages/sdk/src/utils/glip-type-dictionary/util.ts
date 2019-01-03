/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-09 13:22:02
 * Copyright © RingCentral. All rights reserved.
 */

// http://git.ringcentral.com:8888/Glip/glip-type-dictionary

const INTEGRATION_LOWER_ID = 7000;
const TYPE_ID_MASK = 0x1fff;
const MAX_PSEUDO_ID = 0x3ffff;

export default class GlipTypeUtil {
  static isIntegrationType(typeId: number): boolean {
    return typeId >= INTEGRATION_LOWER_ID;
  }
  static extractTypeId(objectId: number): number {
    return objectId > 0 ? objectId & TYPE_ID_MASK : -objectId & TYPE_ID_MASK; // eslint-disable-line no-bitwise
  }

  static generatePseudoIdByType(typeId: number) {
    return -((Math.floor(Math.random() * MAX_PSEUDO_ID) << 13) + typeId);
  }
}
