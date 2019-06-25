/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 15:04:00
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { RCInfoGlobalConfig } from '../config';
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
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { RCInfoService } from '../service';
import { AccountService } from '../../account/service';
import {
  SpecialNumberRuleModel,
  EForwardingNumberFeatureType,
  ForwardingFlipNumberModel,
} from '../types';
import { AccountGlobalConfig } from 'sdk/module/account/config';

const OLD_EXIST_SPECIAL_NUMBER_COUNTRY = 1; // in old version, we only store US special number
const EXTENSION_PHONE_NUMBER_LIST_COUNT = 1000;

import { RCInfoForwardingNumberController } from './RCInfoForwardingNumberController';
class RCInfoFetchController {
  private _isRCInfoJobScheduled: boolean;
  private _shouldIgnoreFirstTime: boolean;
  private _forwardingNumberController: RCInfoForwardingNumberController;

  constructor() {
    this._isRCInfoJobScheduled = false;
    this._shouldIgnoreFirstTime = false;
    this._forwardingNumberController = new RCInfoForwardingNumberController();
  }

  private get rcInfoUserConfig() {
    return ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    ).DBConfig;
  }

  requestRCInfo(): void {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
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
        JOB_KEY.FETCH_RC_ACCOUNT_SERVICE_INFO,
        this.requestAccountServiceInfo,
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
        JOB_KEY.FETCH_FORWARDING_NUMBER,
        this._getForwardingNumberController().requestForwardingNumbers,
        false,
      );
      this.scheduleRCInfoJob(
        JOB_KEY.FETCH_PHONE_DATA,
        this.requestRCPhoneData,
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
    await this.rcInfoUserConfig.setSpecialNumberRules(specialNumbers);
    notificationCenter.emit(RC_INFO.SPECIAL_NUMBER_RULE, specialNumbers);
  }

  private async _getCurrentCountryId() {
    const userId = AccountGlobalConfig.getUserDictionary() as number;
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
    const extensionPhoneNumberList = await RCInfoApi.getExtensionPhoneNumberList(
      { perPage: EXTENSION_PHONE_NUMBER_LIST_COUNT },
    );
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

  async getRCExtensionId(): Promise<number | undefined> {
    const extensionInfo = await this.getRCExtensionInfo();
    return extensionInfo && extensionInfo.id;
  }

  async getRCRolePermissions(): Promise<RCRolePermissions | undefined> {
    return (await this.rcInfoUserConfig.getRolePermissions()) || undefined;
  }

  // this for DB special number compatibility, we can remove it after all user updated to 1.4
  private _isISpecialServiceNumber(model: any): model is ISpecialServiceNumber {
    return (
      model && model.uri && model.records && model.paging && model.navigation
    );
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

  async getForwardingFlipNumbers(
    type: EForwardingNumberFeatureType,
  ): Promise<ForwardingFlipNumberModel[]> {
    return await this._getForwardingNumberController().getForwardingFlipNumbers(
      type,
    );
  }

  private _getForwardingNumberController() {
    if (!this._forwardingNumberController) {
      this._forwardingNumberController = new RCInfoForwardingNumberController();
    }
    return this._forwardingNumberController;
  }
}

export { RCInfoFetchController };
