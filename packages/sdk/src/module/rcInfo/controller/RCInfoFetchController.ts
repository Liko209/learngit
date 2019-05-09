/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 15:04:00
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { RCInfoUserConfig, RCInfoGlobalConfig } from '../config';
import { ACCOUNT_TYPE_ENUM } from '../../../authenticator/constants';
import {
  RCInfoApi,
  RCClientInfo,
  RCAccountInfo,
  RCExtensionInfo,
  RCRolePermissions,
  ISpecialServiceNumber,
  AccountServiceInfo,
  IExtensionPhoneNumberList,
} from '../../../api/ringcentral';
import { jobScheduler, JOB_KEY } from '../../../framework/utils/jobSchedule';
import { mainLogger } from 'foundation';
import notificationCenter from '../../../service/notificationCenter';
import { RC_INFO } from '../../../service/eventKey';
import { AccountUserConfig } from '../../../module/account/config';
import { SpecialNumberRuleModel } from '../types';

const OLD_EXIST_SPECIAL_NUMBER_COUNTRY = 1; // in old version, we only store US special number

class RCInfoFetchController {
  private _rcInfoUserConfig: RCInfoUserConfig;
  private _isRCInfoJobScheduled: boolean;
  private _shouldIgnoreFirstTime: boolean;

  constructor() {
    this._isRCInfoJobScheduled = false;
    this._shouldIgnoreFirstTime = false;
  }

  private get rcInfoUserConfig(): RCInfoUserConfig {
    if (!this._rcInfoUserConfig) {
      this._rcInfoUserConfig = new RCInfoUserConfig();
    }
    return this._rcInfoUserConfig;
  }

  requestRCInfo(): void {
    const userConfig = new AccountUserConfig();
    const accountType = userConfig.getAccountType();
    if (!this._isRCInfoJobScheduled && accountType === ACCOUNT_TYPE_ENUM.RC) {
      this.scheduleRCInfoJob(
        JOB_KEY.FETCH_CLIENT_INFO,
        this.requestRCClientInfo,
        this._shouldIgnoreFirstTime,
      );
      this.scheduleRCInfoJob(
        JOB_KEY.FETCH_ACCOUNT_INFO,
        this.requestRCAccountInfo,
        this._shouldIgnoreFirstTime,
      );
      this.scheduleRCInfoJob(
        JOB_KEY.FETCH_EXTENSION_INFO,
        this.requestRCExtensionInfo,
        this._shouldIgnoreFirstTime,
      );
      this.scheduleRCInfoJob(
        JOB_KEY.FETCH_ROLE_PERMISSIONS,
        this.requestRCRolePermissions,
        this._shouldIgnoreFirstTime,
      );
      this.scheduleRCInfoJob(
        JOB_KEY.FETCH_PHONE_DATA,
        this.requestRCPhoneData,
        false,
      );
      this.scheduleRCInfoJob(
        JOB_KEY.FETCH_SPECIAL_NUMBER_RULE,
        this.requestSpecialNumberRule,
        false,
      );

      this.scheduleRCInfoJob(
        JOB_KEY.FETCH_EXTENSION_PHONE_NUMBER_LIST,
        this.requestExtensionPhoneNumberList,
        false,
      );
      this.scheduleRCInfoJob(
        JOB_KEY.FETCH_DIALING_PLAN,
        this.requestDialingPlan,
        false,
      );
      this.scheduleRCInfoJob(
        JOB_KEY.FETCH_RC_ACCOUNT_SERVICE_INFO,
        this.requestAccountServiceInfo,
        false,
      );
      this._isRCInfoJobScheduled = true;
    }
  }

  scheduleRCInfoJob(
    key: JOB_KEY,
    executeFunc: () => void,
    ignoreFirstTime: boolean,
  ): void {
    jobScheduler.scheduleDailyPeriodicJob(
      key,
      async (callback: (successful: boolean) => void) => {
        try {
          await executeFunc();
          callback(true);
        } catch (err) {
          if (err.message.includes('Not Modified')) {
            callback(true);
          } else {
            mainLogger.error(`RCInfoController, ${key}, ${err}`);
            callback(false);
          }
        }
      },
      true,
      ignoreFirstTime,
    );
  }

  requestRCClientInfo = async (): Promise<void> => {
    const clientInfo = await RCInfoApi.requestRCClientInfo();
    await this.rcInfoUserConfig.setClientInfo(clientInfo);
    notificationCenter.emit(RC_INFO.CLIENT_INFO, clientInfo);
  }

  requestRCAccountInfo = async (): Promise<void> => {
    const accountInfo = await RCInfoApi.requestRCAccountInfo();
    await this.rcInfoUserConfig.setAccountInfo(accountInfo);
    notificationCenter.emit(RC_INFO.ACCOUNT_INFO, accountInfo);
  }

  requestRCExtensionInfo = async (): Promise<void> => {
    const extensionInfo = await RCInfoApi.requestRCExtensionInfo();
    await this.rcInfoUserConfig.setExtensionInfo(extensionInfo);
    notificationCenter.emit(RC_INFO.EXTENSION_INFO, extensionInfo);
  }

  requestRCRolePermissions = async (): Promise<void> => {
    const rolePermissions = await RCInfoApi.requestRCRolePermissions();
    await this.rcInfoUserConfig.setRolePermissions(rolePermissions);
    notificationCenter.emit(RC_INFO.ROLE_PERMISSIONS, rolePermissions);
  }

  requestSpecialNumberRule = async (): Promise<void> => {
    const countryId = await this._getCurrentCountryId();
    const specialNumberRule = await RCInfoApi.getSpecialNumbers({
      countryId,
    });
    const specialNumbers = (await this._getAllSpecialNumberRules()) || {};
    specialNumbers[countryId] = specialNumberRule;
    await this._rcInfoUserConfig.setSpecialNumberRules(specialNumbers);
    notificationCenter.emit(RC_INFO.SPECIAL_NUMBER_RULE, specialNumbers);
  }

  private async _getCurrentCountryId() {
    const userId = new AccountUserConfig().getGlipUserId() as number;
    const stationLocations = RCInfoGlobalConfig.getStationLocation();
    const stationLocation =
      stationLocations && stationLocations[userId.toString()];
    const strId =
      stationLocation &&
      stationLocation.countryInfo &&
      stationLocation.countryInfo.id;
    return strId && strId.length ? _.toInteger(strId) : 1;
  }

  requestRCPhoneData = async (): Promise<void> => {
    const phoneDataVersion: string = (await this.getPhoneDataVersion()) || '';

    const phoneData = await RCInfoApi.getPhoneParserData(phoneDataVersion);
    await this.rcInfoUserConfig.setPhoneData(phoneData);
    notificationCenter.emit(RC_INFO.PHONE_DATA, phoneData);
  }

  requestExtensionPhoneNumberList = async (): Promise<void> => {
    const extensionPhoneNumberList = await RCInfoApi.getExtensionPhoneNumberList();
    await this.rcInfoUserConfig.setExtensionPhoneNumberList(
      extensionPhoneNumberList,
    );
    notificationCenter.emit(
      RC_INFO.EXTENSION_PHONE_NUMBER_LIST,
      extensionPhoneNumberList,
    );
  }
  requestDialingPlan = async (): Promise<void> => {
    const dialingPlan = await RCInfoApi.getDialingPlan();
    await this.rcInfoUserConfig.setDialingPlan(dialingPlan);
    notificationCenter.emit(RC_INFO.DIALING_PLAN, dialingPlan);
  }

  requestAccountServiceInfo = async (): Promise<void> => {
    const accountServiceInfo = await RCInfoApi.getAccountServiceInfo();
    await this.rcInfoUserConfig.setAccountServiceInfo(accountServiceInfo);
    notificationCenter.emit(RC_INFO.RC_SERVICE_INFO, accountServiceInfo);
  }

  async requestRCAccountRelativeInfo(): Promise<void> {
    this._shouldIgnoreFirstTime = true;
    await this.requestRCClientInfo();
    await this.requestRCAccountInfo();
    await this.requestRCExtensionInfo();
    await this.requestRCRolePermissions();
  }

  async getRCClientInfo(): Promise<RCClientInfo | undefined> {
    return (await this.rcInfoUserConfig.getClientInfo()) || undefined;
  }

  async getRCAccountInfo(): Promise<RCAccountInfo | undefined> {
    return (await this.rcInfoUserConfig.getAccountInfo()) || undefined;
  }

  async getRCExtensionInfo(): Promise<RCExtensionInfo | undefined> {
    return (await this.rcInfoUserConfig.getExtensionInfo()) || undefined;
  }

  async getRCRolePermissions(): Promise<RCRolePermissions | undefined> {
    return (await this.rcInfoUserConfig.getRolePermissions()) || undefined;
  }

  // this for DB special number compatibility, we can remove it after all user updated to 1.4
  private _isISpecialServiceNumber(arg: any): arg is ISpecialServiceNumber {
    return arg.uri && arg.records && arg.paging && arg.navigation;
  }

  async getSpecialNumberRule(): Promise<ISpecialServiceNumber | undefined> {
    const allNumbers = await this._getAllSpecialNumberRules();
    // for DB object compatibility
    if (this._isISpecialServiceNumber(allNumbers)) {
      return allNumbers;
    }
    const countryId = await this._getCurrentCountryId();
    return allNumbers && allNumbers[countryId];
  }

  private async _getAllSpecialNumberRules(): Promise<
    SpecialNumberRuleModel | ISpecialServiceNumber | undefined
  > {
    return (await this.rcInfoUserConfig.getSpecialNumberRules()) || undefined;
  }

  async getSpecialNumberRuleByCountryId(countryId: number) {
    const specialNumbers = await this._getAllSpecialNumberRules();
    if (
      this._isISpecialServiceNumber(specialNumbers) &&
      countryId === OLD_EXIST_SPECIAL_NUMBER_COUNTRY
    ) {
      return specialNumbers;
    }
    return (specialNumbers && specialNumbers[countryId]) || undefined;
  }

  async getPhoneData(): Promise<string | undefined> {
    return (await this.rcInfoUserConfig.getPhoneData()) || undefined;
  }

  async setPhoneData(phoneData: string): Promise<void> {
    await this.rcInfoUserConfig.setPhoneData(phoneData);
  }

  async getPhoneDataVersion(): Promise<string | undefined> {
    return (await this.rcInfoUserConfig.getPhoneDataVersion()) || undefined;
  }

  async setPhoneDataVersion(version: string): Promise<void> {
    await this.rcInfoUserConfig.setPhoneDataVersion(version);
  }

  async getExtensionPhoneNumberList(): Promise<
    IExtensionPhoneNumberList | undefined
  > {
    return (
      (await this.rcInfoUserConfig.getExtensionPhoneNumberList()) || undefined
    );
  }
  async getDialingPlan() {
    return (await this.rcInfoUserConfig.getDialingPlan()) || undefined;
  }

  async getAccountServiceInfo(): Promise<AccountServiceInfo | undefined> {
    return (await this.rcInfoUserConfig.getAccountServiceInfo()) || undefined;
  }
}

export { RCInfoFetchController };
