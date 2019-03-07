/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 15:04:00
 * Copyright © RingCentral. All rights reserved.
 */

import { RcInfoUserConfig } from '../config';
import { NewGlobalConfig } from '../../../service/config/NewGlobalConfig';
import { ACCOUNT_TYPE_ENUM } from '../../../authenticator/constants';
import { RcInfoApi, TelephonyApi } from '../../../api/ringcentral';
import { PhoneParserUtility } from '../../../utils/phoneParser';
import { jobScheduler, JOB_KEY } from '../../../framework/utils/jobSchedule';
import AccountService from '../../../service/account';
import { mainLogger } from 'foundation';

class RcInfoController {
  private _rcInfoUserConfig: RcInfoUserConfig;
  private _isRcInfoJobScheduled: boolean;

  constructor() {
    this._isRcInfoJobScheduled = false;
  }

  private get rcInfoUserConfig(): RcInfoUserConfig {
    if (!this._rcInfoUserConfig) {
      this._rcInfoUserConfig = new RcInfoUserConfig();
    }
    return this._rcInfoUserConfig;
  }

  async requestRcInfo() {
    const accountService: AccountService = AccountService.getInstance();
    const accountType = NewGlobalConfig.getAccountType();
    if (
      !this._isRcInfoJobScheduled &&
      accountService.isAccountReady() &&
      accountType === ACCOUNT_TYPE_ENUM.RC
    ) {
      jobScheduler.scheduleDailyPeriodicJob(
        JOB_KEY.FETCH_CLIENT_INFO,
        this.requestRcClientInfo,
      );
      jobScheduler.scheduleDailyPeriodicJob(
        JOB_KEY.FETCH_ACCOUNT_INFO,
        this.requestRcAccountInfo,
      );
      jobScheduler.scheduleDailyPeriodicJob(
        JOB_KEY.FETCH_EXTENSION_INFO,
        this.requestRcExtensionInfo,
      );
      jobScheduler.scheduleDailyPeriodicJob(
        JOB_KEY.FETCH_ROLE_PERMISSION,
        this.requestRcRolePermission,
      );
      jobScheduler.scheduleDailyPeriodicJob(
        JOB_KEY.FETCH_PHONE_DATA,
        this.requestRcPhoneData,
      );
      this._isRcInfoJobScheduled = true;
    }
  }

  requestRcClientInfo = async (callback: (successful: boolean) => void) => {
    try {
      const result = await RcInfoApi.requestRcClientInfo();
      this.rcInfoUserConfig.setClientInfo(result);
      callback(true);
    } catch (err) {
      mainLogger.error(`requestRcClientInfo error: ${err}`);
      callback(false);
    }
  }

  requestRcAccountInfo = async (callback: (successful: boolean) => void) => {
    try {
      const result = await RcInfoApi.requestRcAccountInfo();
      this.rcInfoUserConfig.setAccountInfo(result);
      callback(true);
    } catch (err) {
      mainLogger.error(`requestRcAccountInfo error: ${err}`);
      callback(false);
    }
  }

  requestRcExtensionInfo = async (callback: (successful: boolean) => void) => {
    try {
      const result = await RcInfoApi.requestRcExtensionInfo();
      this.rcInfoUserConfig.setExtensionInfo(result);
      callback(true);
    } catch (err) {
      mainLogger.error(`requestRcExtensionInfo error: ${err}`);
      callback(false);
    }
  }

  requestRcRolePermission = async (callback: (successful: boolean) => void) => {
    try {
      const result = await RcInfoApi.requestRcRolePermission();
      this.rcInfoUserConfig.setRolePermission(result);
      callback(true);
    } catch (err) {
      mainLogger.error(`requestRcRolePermission error: ${err}`);
      callback(false);
    }
  }

  requestRcPhoneData = async (callback: (successful: boolean) => void) => {
    try {
      const phoneDataVersion: string =
        PhoneParserUtility.getPhoneDataFileVersion() || '';
      const result = await TelephonyApi.getPhoneParserData(phoneDataVersion);
      NewGlobalConfig.setPhoneData(result);
      PhoneParserUtility.initPhoneParser(true);
      callback(true);
    } catch (err) {
      mainLogger.error(`requestRcPhoneData error: ${err.message}`);
      if (err.message.includes('Not Modified')) {
        callback(true);
      } else {
        callback(false);
      }
    }
  }
}

export { RcInfoController };
