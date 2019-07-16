/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-02 17:02:29
 * Copyright © RingCentral. All rights reserved.
 */

import {
  FEATURE_PERMISSIONS,
  MAKE_CALL_ERROR_CODE,
  E911_STATUS,
} from '../types';
import { RCInfoService } from '../../rcInfo';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { PhoneNumberService } from 'sdk/module/phoneNumber';
/* eslint-disable */
class MakeCallController {
  private _checkInternetConnection() {
    if (!window.navigator.onLine) {
      return MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION;
    }
    return MAKE_CALL_ERROR_CODE.NO_ERROR;
  }

  private async _isRCFeaturePermissionEnabled(permission: FEATURE_PERMISSIONS) {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const extInfo = await rcInfoService.getRCExtensionInfo();
    if (extInfo) {
      for (const index in extInfo.serviceFeatures) {
        const feature = extInfo.serviceFeatures[index];
        if (feature.featureName !== permission) {
          continue;
        }
        return feature.enabled;
      }
    }
    return false;
  }

  private _getRCE911Status() {
    // It's not implemented, return accpted by default
    return E911_STATUS.ACCEPTED;
  }

  private async _checkE911Status() {
    if (
      (await this._isRCFeaturePermissionEnabled(
        FEATURE_PERMISSIONS.VOIP_CALLING,
      )) &&
      this._getRCE911Status() !== E911_STATUS.ACCEPTED
    ) {
      return MAKE_CALL_ERROR_CODE.E911_ACCEPT_REQUIRED;
    }
    return MAKE_CALL_ERROR_CODE.NO_ERROR;
  }

  private async _checkVoipN11Number(phoneNumber: string) {
    let result = MAKE_CALL_ERROR_CODE.NO_ERROR;
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const phoneNumService = ServiceLoader.getInstance<PhoneNumberService>(
      ServiceConfig.PHONE_NUMBER_SERVICE,
    );
    const specialNumber = await rcInfoService.getSpecialNumberRule();
    if (specialNumber) {
      for (const index in specialNumber.records) {
        // We have no emergency address for now, all N11 numbers
        // are not allowed to dial out
        const record = specialNumber.records[index];
        if (record.phoneNumber === phoneNumber) {
          result = MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER;
          break;
        }
        const e164N11Num = await phoneNumService.getE164PhoneNumber(
          record.phoneNumber,
        );
        if (e164N11Num === phoneNumber) {
          result = MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER;
          break;
        }
      }
    }
    return result;
  }

  async tryMakeCall(e164PhoneNumber: string): Promise<MAKE_CALL_ERROR_CODE> {
    let result = MAKE_CALL_ERROR_CODE.NO_ERROR;
    do {
      result = this._checkInternetConnection();
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
      result = await this._checkE911Status();
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
      result = await this._checkVoipN11Number(e164PhoneNumber);
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
    } while (false);

    return result;
  }
}

export { MakeCallController };
