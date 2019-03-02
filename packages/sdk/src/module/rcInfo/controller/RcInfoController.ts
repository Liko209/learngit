/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 15:04:00
 * Copyright © RingCentral. All rights reserved.
 */

import { RcInfoConfig } from '../config';
import { NewGlobalConfig } from '../../../service/config/NewGlobalConfig';
import { ACCOUNT_TYPE_ENUM } from '../../../authenticator/constants';
import { RcInfoApi, TelephonyApi } from '../../../api/ringcentral';
import { PhoneParserUtility } from '../../../utils/phoneParser';

class RcInfoController {
  constructor() {}

  async requestRcInfo() {
    const accountType = NewGlobalConfig.getAccountType();
    if (accountType === ACCOUNT_TYPE_ENUM.RC) {
      this.requestRcClientInfo();
      this.requestRcAccountInfo();
      this.requestRcExtensionInfo();
      this.requestRcRolePermission();
      this.requestRcPhoneData();
    }
  }

  async requestRcClientInfo() {
    const result = await RcInfoApi.requestRcClientInfo();
    RcInfoConfig.setRcClientInfo(result);
  }

  async requestRcAccountInfo() {
    const result = await RcInfoApi.requestRcAccountInfo();
    RcInfoConfig.setRcAccountInfo(result);
  }

  async requestRcExtensionInfo() {
    const result = await RcInfoApi.requestRcExtensionInfo();
    RcInfoConfig.setRcExtensionInfo(result);
  }

  async requestRcRolePermission() {
    const result = await RcInfoApi.requestRcRolePermission();
    RcInfoConfig.setRcRolePermissions(result);
  }

  async requestRcPhoneData() {
    const phoneDataVersion: string =
      PhoneParserUtility.getPhoneDataFileVersion() || '';
    const result = await TelephonyApi.getPhoneParserData(phoneDataVersion);
    RcInfoConfig.setRcPhoneData(result);
  }
}

export { RcInfoController };
