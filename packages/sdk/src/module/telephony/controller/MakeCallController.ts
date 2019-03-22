/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-02 17:02:29
 * Copyright © RingCentral. All rights reserved.
 */
import { RcExtensionInfo } from '../../../api/ringcentral/types/RcExtensionInfo';
import {
  FEATURE_PERMISSIONS,
  MAKE_CALL_ERROR_CODE,
  E911_STATUS,
} from '../types';
import { ISpecialServiceNumberResponse } from '../../../api/ringcentral/types/common';
import { PhoneParserUtility } from '../../../utils/phoneParser';
import { PersonService } from '../../person';
import { ContactType } from '../../person/types';
import { RcInfoService } from '../../rcInfo/service';

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

  private _isRcFeaturePermissionEnabled(permission: FEATURE_PERMISSIONS) {
    const rcInfoService: RcInfoService = RcInfoService.getInstance();
    const extInfo: RcExtensionInfo = rcInfoService.getRcExtensionInfo();
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

  private _getRcE911Status() {
    // It's not implemented, return accpted by default
    return E911_STATUS.ACCEPTED;
  }

  private _checkE911Status() {
    if (
      this._isRcFeaturePermissionEnabled(FEATURE_PERMISSIONS.VOIP_CALLING) &&
      this._getRcE911Status() !== E911_STATUS.ACCEPTED
    ) {
      return MAKE_CALL_ERROR_CODE.E911_ACCEPT_REQUIRED;
    }
    return MAKE_CALL_ERROR_CODE.NO_ERROR;
  }

  private _checkVoipN11Number(phoneNumber: string) {
    let result = MAKE_CALL_ERROR_CODE.NO_ERROR;
    const rcInfoService: RcInfoService = RcInfoService.getInstance();
    const specialNumber: ISpecialServiceNumberResponse = rcInfoService.getSpecialNumberRule();
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

  private _isLoggedInRcOnlyMode() {
    // It's not implemented right now
    // TODO FIJI-3967
    return false;
  }

  private async _checkShortPhoneNumber(phoneNumber: string) {
    let res = MAKE_CALL_ERROR_CODE.NO_ERROR;
    const phoneParserUtility = PhoneParserUtility.getPhoneParser(
      phoneNumber,
      true,
    );
    if (phoneParserUtility && phoneParserUtility.isShortNumber()) {
      do {
        const personService: PersonService = PersonService.getInstance();
        const result = await personService.matchContactByPhoneNumber(
          phoneNumber,
          ContactType.GLIP_CONTACT,
        );
        if (result || this._isLoggedInRcOnlyMode()) {
          break;
        }
        res = MAKE_CALL_ERROR_CODE.INVALID_EXTENSION_NUMBER;
      } while (0);
    }
    return res;
  }

  private _checkInternationalCallsPermission(phoneNumber: string) {
    const phoneParserUtility = PhoneParserUtility.getPhoneParser(
      phoneNumber,
      true,
    );

    if (phoneParserUtility && phoneParserUtility.isInternationalDialing()) {
      if (
        !this._isRcFeaturePermissionEnabled(
          FEATURE_PERMISSIONS.INTERNATIONAL_CALLING,
        )
      ) {
        return MAKE_CALL_ERROR_CODE.NO_INTERNATIONAL_CALLS_PERMISSION;
      }
    }
    return MAKE_CALL_ERROR_CODE.NO_ERROR;
  }

  private _checkVoipStatusAndCallSetting() {
    // countryBlock & unavailable this will be provided by Voip team.
    // No Ringout feature
    // TODO FIJI-3837
    return MAKE_CALL_ERROR_CODE.NO_ERROR;
  }

  getE164PhoneNumber(phoneNumber: string) {
    const phoneParserUtility = PhoneParserUtility.getPhoneParser(
      phoneNumber,
      true,
    );
    const e164PhoneNumber = phoneParserUtility
      ? phoneParserUtility.getE164()
      : phoneNumber;
    return e164PhoneNumber;
  }

  async tryMakeCall(e164PhoneNumber: string): Promise<MAKE_CALL_ERROR_CODE> {
    let result = MAKE_CALL_ERROR_CODE.NO_ERROR;
    do {
      result = this._checkInternetConnection();
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
      result = this._checkE911Status();
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
      result = this._checkVoipStatusAndCallSetting();
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
      result = this._checkVoipN11Number(e164PhoneNumber);
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
      result = await this._checkShortPhoneNumber(e164PhoneNumber);
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
      result = this._checkInternationalCallsPermission(e164PhoneNumber);
      if (result !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
    } while (false);

    return result;
  }
}

export { MakeCallController };
