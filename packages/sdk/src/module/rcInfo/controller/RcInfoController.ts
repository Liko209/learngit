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
import { mainLogger } from 'foundation';

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
    try {
      const result = await RcInfoApi.requestRcClientInfo();
      RcInfoConfig.setRcClientInfo(result);
    } catch (err) {
      mainLogger.error(`requestRcClientInfo error: ${err}`);
    }
  }

  async requestRcAccountInfo() {
    try {
      const result = await RcInfoApi.requestRcAccountInfo();
      RcInfoConfig.setRcAccountInfo(result);
    } catch (err) {
      mainLogger.error(`requestRcAccountInfo error: ${err}`);
    }
  }

  async requestRcExtensionInfo() {
    try {
      const result = await RcInfoApi.requestRcExtensionInfo();
      RcInfoConfig.setRcExtensionInfo(result);
    } catch (err) {
      mainLogger.error(`requestRcExtensionInfo error: ${err}`);
    }
  }

  async requestRcRolePermission() {
    try {
      const result = await RcInfoApi.requestRcRolePermission();
      RcInfoConfig.setRcRolePermissions(result);
    } catch (err) {
      mainLogger.error(`requestRcRolePermission error: ${err}`);
    }
  }

  async requestRcPhoneData() {
    try {
      const phoneDataVersion: string =
        PhoneParserUtility.getPhoneDataFileVersion() || '';
      const result = await TelephonyApi.getPhoneParserData(phoneDataVersion);
      RcInfoConfig.setRcPhoneData(result);
      PhoneParserUtility.initPhoneParser(true);
    } catch (err) {
      mainLogger.error(`requestRcPhoneData error: ${err}`);
    }
  }
}

export { RcInfoController };
