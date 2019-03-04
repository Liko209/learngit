/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-02 17:02:29
 * Copyright © RingCentral. All rights reserved.
 */
import { RcInfoUserConfig } from '../../rcInfo/config';
import { RcExtensionInfo } from '../../../api/ringcentral/types/RcExtensionInfo';
import {
  FEATURE_PERMISSIONS,
  MAKE_CALL_ERROR_CODE,
  E911_STATUS,
} from '../types';
import { ISpecialServiceNumberResponse } from '../../../api/ringcentral/types';

enum RCN11Reason {
  N11_101 = 'N11-101',
  N11_102 = 'N11-102',
}

class MakeCallController {
  private _rcInfo: RcInfoUserConfig;
  constructor() {
    this._rcInfo = new RcInfoUserConfig();
  }

  private _checkInternetConnection() {
    if (!window.navigator.onLine) {
      return MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION;
    }
    return MAKE_CALL_ERROR_CODE.NO_ERROR;
  }

  // private _getE164() {}
  private _isRcFeaturePermissionEnabled(permission: FEATURE_PERMISSIONS) {
    const extInfo: RcExtensionInfo = this._rcInfo.getExtensionInfo();
    if (extInfo) {
      for (const index in extInfo.serviceFeatures) {
        const feature = extInfo.serviceFeatures[index];
        if (feature.featureName !== permission) {
          continue;
        }
        if (feature.enabled) {
          return true;
        }
        return false;
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
  // private _checkBetaFlag() {}
  private _checkVoipN11Number(phoneNumber: string) {
    let errorCode = MAKE_CALL_ERROR_CODE.NO_ERROR;
    const specialNumber: ISpecialServiceNumberResponse = this._rcInfo.getSpecialNumberRule();
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
          errorCode = MAKE_CALL_ERROR_CODE.N11_101;
          break;
        }
        if (record.features.voip.reason.id === RCN11Reason.N11_102) {
          errorCode = MAKE_CALL_ERROR_CODE.N11_102;
          break;
        }
        errorCode = MAKE_CALL_ERROR_CODE.N11_OTHERS;
      }
    }
    return errorCode;
  }

  private _isShortNumber() {
    return false;
  }

  private _matchContactByPhoneNumber() {
    return true;
  }

  private _isLoggedInRcOnlyMode() {
    // It's not implemented right now
    return false;
  }

  private _checkNormalPhoneNumber() {
    // isShortNumber need to match contact
    let errorCode = MAKE_CALL_ERROR_CODE.NO_ERROR;
    if (this._isShortNumber()) {
      do {
        if (this._matchContactByPhoneNumber()) {
          break;
        }
        if (this._isLoggedInRcOnlyMode()) {
          break;
        }
        errorCode = MAKE_CALL_ERROR_CODE.INVALID_EXTENSION_NUBMER;
      } while (0);
    }
    return errorCode;
  }

  private _isInternationalDialing() {
    return true;
  }

  private _checkInternationalCallsPermission() {
    // phone parser isInternationalDialing
    // isRcFeaturePermissionEnabled(ERcServiceFeaturePermission::INTERNATIONAL_CALLING))
    if (this._isInternationalDialing()) {
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
    return MAKE_CALL_ERROR_CODE.NO_ERROR;
  }

  // private _checkTryVoIPCall() {}

  tryMakeCall(phoneNumber: string): MAKE_CALL_ERROR_CODE {
    // getE164
    let errorCode = MAKE_CALL_ERROR_CODE.NO_ERROR;
    do {
      errorCode = this._checkInternetConnection();
      if (errorCode !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
      errorCode = this._checkE911Status();
      if (errorCode !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
      errorCode = this._checkVoipStatusAndCallSetting();
      if (errorCode !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
      errorCode = this._checkVoipN11Number(phoneNumber);
      if (errorCode !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
      errorCode = this._checkNormalPhoneNumber();
      if (errorCode !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
      errorCode = this._checkInternationalCallsPermission();
      if (errorCode !== MAKE_CALL_ERROR_CODE.NO_ERROR) {
        break;
      }
    } while (false);

    return errorCode;
  }
}

export { MakeCallController };
