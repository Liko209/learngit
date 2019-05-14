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
import { PhoneParserUtility } from '../../../utils/phoneParser';
import { PersonService } from '../../person';
import { ContactType } from '../../person/types';
import { RCInfoService } from '../../rcInfo';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';

enum RCN11Reason {
  N11_101 = 'N11-101',
  N11_102 = 'N11-102',
}

class MakeCallController {
  constructor() {}

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
    const specialNumber = await rcInfoService.getSpecialNumberRule();
    if (specialNumber) {
      for (const index in specialNumber.records) {
        const record = specialNumber.records[index];
        if (record.phoneNumber !== phoneNumber) {
          continue;
        }
        if (record.features.voip.enabled) {
          break;
        }
        if (record.features.voip.reason.id === RCN11Reason.N11_101) {
          result = MAKE_CALL_ERROR_CODE.N11_101;
          break;
        }
        if (record.features.voip.reason.id === RCN11Reason.N11_102) {
          result = MAKE_CALL_ERROR_CODE.N11_102;
          break;
        }
        result = MAKE_CALL_ERROR_CODE.N11_OTHERS;
      }
    }
    return result;
  }

  private _isLoggedInRCOnlyMode() {
    // It's not implemented right now
    // TODO FIJI-3967
    return false;
  }

  private async _checkShortPhoneNumber(phoneNumber: string) {
    let res = MAKE_CALL_ERROR_CODE.NO_ERROR;
    const phoneParserUtility = await PhoneParserUtility.getPhoneParser(
      phoneNumber,
      false,
    );
    if (phoneParserUtility && phoneParserUtility.isShortNumber()) {
      do {
        const personService = ServiceLoader.getInstance<PersonService>(
          ServiceConfig.PERSON_SERVICE,
        );
        const result = await personService.matchContactByPhoneNumber(
          phoneNumber,
          ContactType.GLIP_CONTACT,
        );
        if (result || this._isLoggedInRCOnlyMode()) {
          break;
        }
        res = MAKE_CALL_ERROR_CODE.INVALID_EXTENSION_NUMBER;
      } while (0);
    }
    return res;
  }

  private async _checkInternationalCallsPermission(phoneNumber: string) {
    const phoneParserUtility = await PhoneParserUtility.getPhoneParser(
      phoneNumber,
      false,
    );

    if (
      phoneParserUtility &&
      (await phoneParserUtility.isInternationalDialing())
    ) {
      if (
        !(await this._isRCFeaturePermissionEnabled(
          FEATURE_PERMISSIONS.INTERNATIONAL_CALLING,
        ))
      ) {
        return MAKE_CALL_ERROR_CODE.NO_INTERNATIONAL_CALLS_PERMISSION;
      }
    }
    return MAKE_CALL_ERROR_CODE.NO_ERROR;
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
      result = await this._checkShortPhoneNumber(e164PhoneNumber);
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
      result = await this._checkInternationalCallsPermission(e164PhoneNumber);
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
    } while (false);

    return result;
  }
}

export { MakeCallController };
