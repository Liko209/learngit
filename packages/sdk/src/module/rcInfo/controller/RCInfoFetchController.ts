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
  GetBlockNumberListParams,
  BlockNumberItem,
  BLOCK_STATUS,
  IDeviceRequest,
  DeviceInfo,
  DeviceRecord,
  IStateRequest,
  CountryRecord,
} from 'sdk/api/ringcentral';
import { jobScheduler, JOB_KEY } from 'sdk/framework/utils/jobSchedule';
import { mainLogger } from 'foundation/log';
import notificationCenter from 'sdk/service/notificationCenter';
import { RC_INFO } from 'sdk/service/eventKey';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { RCInfoService } from '../service';
import { AccountService } from '../../account/service';
import {
  SpecialNumberRuleModel,
  EForwardingNumberFeatureType,
  ForwardingFlipNumberModel,
} from '../types';
import { AccountGlobalConfig } from 'sdk/module/account/config';
import { RCInfoForwardingNumberController } from './RCInfoForwardingNumberController';
import {
  IExtensionCallerId,
  StateRecord,
  ICountryRequest,
} from 'sdk/api/ringcentral/types/common';
import { Nullable } from 'sdk/types';

const OLD_EXIST_SPECIAL_NUMBER_COUNTRY = 1; // in old version, we only store US special number
const DEFAULT_PAGE_SIZE = 1000; // callerId(more than 200)

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
        JOB_KEY.FETCH_DEVICE_INFO,
        this.requestDeviceInfo,
        false,
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
        JOB_KEY.FETCH_EXTENSION_CALLER_ID,
        this.requestExtensionCallerId,
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
      this.scheduleRCInfoJob(
        JOB_KEY.FETCH_BLOCK_NUMBER,
        this.requestBlockNumberList,
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
  };

  requestRCAccountInfo = async (): Promise<void> => {
    const accountInfo = await RCInfoApi.requestRCAccountInfo();
    await this.rcInfoUserConfig.setAccountInfo(accountInfo);
    notificationCenter.emit(RC_INFO.ACCOUNT_INFO, accountInfo);
  };

  requestRCExtensionInfo = async (): Promise<void> => {
    const extensionInfo = await RCInfoApi.requestRCExtensionInfo();
    await this.rcInfoUserConfig.setExtensionInfo(extensionInfo);
    notificationCenter.emit(RC_INFO.EXTENSION_INFO, extensionInfo);
  };

  requestRCRolePermissions = async (): Promise<void> => {
    const rolePermissions = await RCInfoApi.requestRCRolePermissions();
    await this.rcInfoUserConfig.setRolePermissions(rolePermissions);
    notificationCenter.emit(RC_INFO.ROLE_PERMISSIONS, rolePermissions);
  };

  requestSpecialNumberRule = async (): Promise<void> => {
    const countryId = await this._getCurrentCountryId();
    const specialNumberRule = await RCInfoApi.getSpecialNumbers({
      countryId,
    });
    const specialNumbers = (await this._getAllSpecialNumberRules()) || {};
    specialNumbers[countryId] = specialNumberRule;
    await this.rcInfoUserConfig.setSpecialNumberRules(specialNumbers);
    notificationCenter.emit(RC_INFO.SPECIAL_NUMBER_RULE, specialNumbers);
  };

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
  };

  requestExtensionPhoneNumberList = async (): Promise<void> => {
    const extensionPhoneNumberList = await RCInfoApi.getExtensionPhoneNumberList(
      { perPage: DEFAULT_PAGE_SIZE },
    );
    await this.rcInfoUserConfig.setExtensionPhoneNumberList(
      extensionPhoneNumberList,
    );
    notificationCenter.emit(
      RC_INFO.EXTENSION_PHONE_NUMBER_LIST,
      extensionPhoneNumberList,
    );
  };

  requestExtensionCallerId = async (): Promise<void> => {
    const extensionCallerId = await RCInfoApi.getExtensionCallerId();
    await this.rcInfoUserConfig.setExtensionCallerId(extensionCallerId);
    notificationCenter.emit(RC_INFO.EXTENSION_CALLER_ID, extensionCallerId);
  };

  requestDialingPlan = async (): Promise<void> => {
    const dialingPlan = await RCInfoApi.getDialingPlan();
    await this.rcInfoUserConfig.setDialingPlan(dialingPlan);
    notificationCenter.emit(RC_INFO.DIALING_PLAN, dialingPlan);
  };

  requestCountryState = async (
    request: IStateRequest,
  ): Promise<StateRecord[]> => {
    const result: StateRecord[] = [];
    await this._requestCountryStateByPage(request, result);
    return result;
  };

  private async _requestCountryStateByPage(
    request: IStateRequest,
    result: StateRecord[],
  ) {
    const response = await RCInfoApi.getCountryState(request);
    response.records && result.push(...response.records.map(data => data));
    if (
      response.paging &&
      response.paging.page &&
      response.paging.totalPages &&
      response.paging.page < response.paging.totalPages
    ) {
      request.page += 1;
      await this._requestCountryStateByPage(request, result);
    }
  }

  requestAccountServiceInfo = async (): Promise<void> => {
    const accountServiceInfo = await RCInfoApi.getAccountServiceInfo();
    await this.rcInfoUserConfig.setAccountServiceInfo(accountServiceInfo);
    notificationCenter.emit(RC_INFO.RC_SERVICE_INFO, accountServiceInfo);
  };

  requestDeviceInfo = async (): Promise<void> => {
    const request: IDeviceRequest = {
      linePooling: 'Host',
    };
    const deviceInfo = await RCInfoApi.getDeviceInfo(request);
    await this.rcInfoUserConfig.setDeviceInfo(deviceInfo);
    notificationCenter.emit(RC_INFO.DEVICE_INFO, deviceInfo);
  };

  requestCountryList = async (
    request: ICountryRequest,
  ): Promise<CountryRecord[]> => {
    const result: CountryRecord[] = [];
    await this._requestCountryListByPage(request, result);
    return result;
  };

  private async _requestCountryListByPage(
    request: ICountryRequest,
    result: CountryRecord[],
  ) {
    const response = await RCInfoApi.getCountryInfo(request);
    response.records && result.push(...response.records.map(data => data));

    const page = _.get(response, 'paging.page', 0);
    const totalPages = _.get(response, 'paging.totalPages', 0);
    if (page < totalPages) {
      request.page += 1;
      await this._requestCountryListByPage(request, result);
    }
  }

  requestBlockNumberList = async (): Promise<void> => {
    const params: GetBlockNumberListParams = {
      page: 1,
      perPage: DEFAULT_PAGE_SIZE,
      status: BLOCK_STATUS.BLOCKED,
    };
    const result: BlockNumberItem[] = [];
    await this._requestBlockNumberListByPage(params, result);
    await this.rcInfoUserConfig.setBlockNumbers(result);
  };

  private async _requestBlockNumberListByPage(
    params: GetBlockNumberListParams,
    result: BlockNumberItem[],
  ) {
    const response = await RCInfoApi.getBlockNumberList(params);
    response.records &&
      result.push(
        ...response.records.filter(
          data => data.status === BLOCK_STATUS.BLOCKED,
        ),
      );
    if (
      response.paging &&
      response.paging.page &&
      response.paging.totalPages &&
      response.paging.page < response.paging.totalPages
    ) {
      params.page += 1;
      await this._requestBlockNumberListByPage(params, result);
    }
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

  async getUserEmail(): Promise<string | undefined> {
    const extensionInfo = await this.getRCExtensionInfo();
    return extensionInfo && _.get(extensionInfo, 'contact.email');
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

  async getExtensionCallerId(): Promise<Nullable<IExtensionCallerId>> {
    return (await this.rcInfoUserConfig.getExtensionCallerId()) || null;
  }

  async setExtensionCallerId(item: IExtensionCallerId): Promise<void> {
    await this.rcInfoUserConfig.setExtensionCallerId(item);
  }

  async getDialingPlan() {
    return (await this.rcInfoUserConfig.getDialingPlan()) || undefined;
  }

  async getAccountServiceInfo(): Promise<AccountServiceInfo | undefined> {
    return (await this.rcInfoUserConfig.getAccountServiceInfo()) || undefined;
  }

  async getDigitalLines(): Promise<DeviceRecord[]> {
    const deviceInfo: DeviceInfo = await this.rcInfoUserConfig.getDeviceInfo();
    return deviceInfo && deviceInfo.records ? deviceInfo.records : [];
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
