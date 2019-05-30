/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-05-29 13:13:57
 * Copyright © RingCentral. All rights reserved.
 */

import {
  RCInfoApi,
  RCExtensionForwardingNumberInfo,
  RCExtensionForwardingNumberRCList,
} from '../../../api/ringcentral';
import notificationCenter from '../../../service/notificationCenter';
import { RC_INFO } from '../../../service/eventKey';
import { RCInfoService } from '../service';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import {
  ForwardingFlipNumberModel,
  EForwardingFlipNumberType,
  EForwardingNumberFeatureType,
} from '../types';
const ForwardingNumberTypeMap = {
  Home: EForwardingFlipNumberType.HOME,
  Work: EForwardingFlipNumberType.WORK,
  Mobile: EForwardingFlipNumberType.MOBILE,
  PhoneLine: EForwardingFlipNumberType.PHONE_LINE,
  Outage: EForwardingFlipNumberType.OUTAGE,
  Other: EForwardingFlipNumberType.OTHER,
};

class RCInfoForwardingNumberController {
  constructor() {}

  private get rcInfoUserConfig() {
    return ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    ).DBConfig;
  }

  requestForwardingNumbers = async (): Promise<void> => {
    const forwardingNumbers = await RCInfoApi.getForwardingNumbers({
      perPage: 1000,
    });
    forwardingNumbers &&
      (await this.rcInfoUserConfig.setForwardingNumbers(forwardingNumbers));
    notificationCenter.emit(RC_INFO.RC_FORWARDING_NUMBERS, forwardingNumbers);
  }

  async getForwardingFlipNumbers(
    type: EForwardingNumberFeatureType,
  ): Promise<ForwardingFlipNumberModel[]> {
    // sync, do not await
    this.requestForwardingNumbers();
    // convert data into model for UI
    const rawData = await this.rcInfoUserConfig.getForwardingNumbers();
    return this._extractForwardingFlipNumbers(type, rawData);
  }

  private _extractForwardingFlipNumbers(
    type: EForwardingNumberFeatureType,
    data: RCExtensionForwardingNumberRCList,
  ): ForwardingFlipNumberModel[] {
    const result: ForwardingFlipNumberModel[] = [];
    if (data && data.records) {
      data.records.forEach((record: RCExtensionForwardingNumberInfo) => {
        if (
          record.features &&
          record.features.includes(type) &&
          record.phoneNumber
        ) {
          const model = {
            phoneNumber: record.phoneNumber,
            flipNumber: Number(record.flipNumber) || 0,
            label: record.label,
            type: this._convertForwardingNumberTypeToEnum(record.type),
          };
          result.push(model);
        }
      });
    }
    return result;
  }

  private _convertForwardingNumberTypeToEnum(type: string) {
    return ForwardingNumberTypeMap.hasOwnProperty(type)
      ? ForwardingNumberTypeMap[type]
      : EForwardingFlipNumberType.OTHER;
  }
}

export { RCInfoForwardingNumberController };
