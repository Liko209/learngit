/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-04-22 15:09:38
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { UndefinedAble } from 'sdk/types';
import {
  DialingPlanCountryRecord,
  DialingCountryInfo,
  StateRecord,
  IStateRequest,
} from 'sdk/api/ringcentral/types';
import { PhoneParserUtility } from 'sdk/utils/phoneParser';
import { RCInfoFetchController } from './RCInfoFetchController';
import { RCAccountInfoController } from './RCAccountInfoController';
import { RCCallerIdController } from './RCCallerIdController';
import {
  SELLING_COUNTRY_LIST,
  SUPPORT_AREA_CODE_COUNTRIES,
  RC_BRAND_NAME_TO_BRAND_ID,
} from './constants';
import {
  RCBrandType,
  StationLocationSetting,
  GlobalStationLocationSetting,
  RegionInfo,
} from '../types';
import { PhoneNumberType } from 'sdk/module/phoneNumber/entity';
import { AccountServiceInfoController } from './AccountServiceInfoController';
import { mainLogger } from 'foundation/log';
import { notificationCenter, RC_INFO, SERVICE } from 'sdk/service';
import { RCInfoGlobalConfig } from '../config';
import { AccountGlobalConfig } from 'sdk/module/account/config';
import {
  ICountryRequest,
  CountryRecord,
} from 'sdk/api/ringcentral/types/common';

type StationSetting = {
  newCountryInfo: DialingCountryInfo;
  areaCode: string;
  updateSpecialNumber?: boolean;
  areaCodeByManual?: boolean;
  countryByManual?: boolean;
};
const LOG_TAG = 'RegionInfoController';
const DefaultCountryInfo = {
  id: '1',
  name: 'United States',
  isoCode: 'US',
  callingCode: '1',
};
const DefaultBrandId = RC_BRAND_NAME_TO_BRAND_ID.RC;
const COUNTRY_PAGE_SIZE = 500;
const STATE_PAGE_SIZE = 400;

class RegionInfoController {
  private _currentCountryInfo: DialingCountryInfo;
  private _notificationKeys: string[];
  private _stateListMap: Map<string, StateRecord[]> = new Map();
  private _countryList: CountryRecord[] = [];

  constructor(
    private _rcInfoFetchController: RCInfoFetchController,
    private _rcAccountInfoController: RCAccountInfoController,
    private _accountServiceInfoController: AccountServiceInfoController,
    private _callerIdController: RCCallerIdController,
  ) {
    this._notificationKeys = [
      RC_INFO.EXTENSION_PHONE_NUMBER_LIST,
      RC_INFO.ACCOUNT_INFO,
      RC_INFO.RC_SERVICE_INFO,
    ];
  }

  init() {
    this._notificationKeys.forEach((key: string) => {
      notificationCenter.on(key, this.updateStationLocation);
    });
  }

  dispose() {
    this._notificationKeys.forEach((key: string) => {
      notificationCenter.off(key, this.updateStationLocation);
    });
  }

  updateStationLocation = () => {
    this.loadRegionInfo();
  };

  async loadRegionInfo() {
    const stationSetting = this._getStationLocation();
    const countryInfo =
      (stationSetting && stationSetting.countryInfo) || DefaultCountryInfo;
    this._updateCurrentCountryId(countryInfo);
    await this._setStationLocation({
      newCountryInfo: countryInfo,
      areaCode: (stationSetting && stationSetting.areaCode) || '',
      updateSpecialNumber: true,
      areaCodeByManual:
        (stationSetting && stationSetting.areaCodeByManual) || false,
      countryByManual:
        (stationSetting && stationSetting.countryByManual) || false,
    });
  }

  async getCountryList(): Promise<DialingCountryInfo[]> {
    const list = await this._getDialingPlanCountryRecords();
    if (list.length === 0) {
      const countryInfo = await this._getCountryFromUserNumber();
      if (countryInfo) {
        list.push(countryInfo);
      }
    }
    return list;
  }

  async getDefaultCountryInfo() {
    return this._getCountryFromUserNumber();
  }

  async getStateList(countryId: string): Promise<StateRecord[]> {
    const list = this._stateListMap.get(countryId);
    if (list) {
      return list;
    }
    const request: IStateRequest = {
      countryId,
      page: 1,
      perPage: STATE_PAGE_SIZE,
    };
    const result = await this._rcInfoFetchController.requestCountryState(
      request,
    );
    result.length && this._stateListMap.set(countryId, result);
    return result;
  }

  async getAllCountryList(): Promise<CountryRecord[]> {
    if (!this._countryList.length) {
      const request: ICountryRequest = { page: 1, perPage: COUNTRY_PAGE_SIZE };
      this._countryList = await this._rcInfoFetchController.requestCountryList(
        request,
      );
    }
    return this._countryList;
  }

  async getCurrentCountry(): Promise<DialingCountryInfo> {
    if (this._currentCountryInfo === undefined) {
      await this.loadRegionInfo();
    }

    const countryInfo = await this._getDialingPlanCountryRecordByISOCode(
      this._currentCountryInfo.isoCode,
    );

    return countryInfo || (await this._getCountryFromUserNumber())!;
  }

  async setDefaultCountry(isoCode: string) {
    const countryInfo =
      (await this._getDialingPlanCountryRecordByISOCode(isoCode)) ||
      (await this._getCountryFromUserNumber());

    mainLogger.tags(LOG_TAG).log('setDefaultCountry', isoCode, countryInfo);
    if (countryInfo) {
      await this._setStationLocation({
        newCountryInfo: countryInfo,
        areaCode: '',
        areaCodeByManual: false,
      });
    }
  }

  async setAreaCode(areaCode: string) {
    const info =
      (await this._getDialingPlanCountryRecordByISOCode(
        this._currentCountryInfo.isoCode,
      )) || DefaultCountryInfo;
    mainLogger.tags(LOG_TAG).log('setAreaCode', areaCode, info);
    await this._setStationLocation({ areaCode, newCountryInfo: info });
  }

  async getAreaCode() {
    return (await PhoneParserUtility.getStationAreaCode()) || '';
  }

  hasAreaCode(countryCallingCode: string) {
    return SUPPORT_AREA_CODE_COUNTRIES.includes(countryCallingCode);
  }

  async isAreaCodeValid(areaCode: string) {
    const countryId =
      (this._currentCountryInfo && this._currentCountryInfo.id) ||
      DefaultCountryInfo.id;
    return await PhoneParserUtility.isAreaCodeValid(
      _.toInteger(countryId),
      areaCode,
    );
  }

  private async _getDialingPlanCountryRecords(): Promise<DialingCountryInfo[]> {
    const plan = await this._rcInfoFetchController.getDialingPlan();
    return (plan && plan.records) || [];
  }

  private async _getCountryFromUserNumber() {
    const phoneNumber = await this._validUserPhoneNumber();
    const callingCode = await this._getAccountCallingCodeByNumber(phoneNumber!);
    return await this._getCountryFromDefaultSellingCountries(callingCode);
  }

  private async _getCountryFromDefaultSellingCountries(callingCode: string) {
    const homeCountry = await this._rcAccountInfoController.getHomeCountry();
    if (homeCountry) {
      const code = homeCountry.callingCode;
      const isoCode = homeCountry.isoCode;
      if (code === callingCode && isoCode) {
        return this._getDefaultCountryInfoByISOCode(isoCode);
      }
    }

    return this._getDefaultCountryInfoByCallingCode(callingCode);
  }

  private async _getAccountCallingCodeByNumber(
    phoneNumber: string,
  ): Promise<string> {
    let countryCode = DefaultCountryInfo.callingCode; // default country
    if (phoneNumber) {
      const phoneParser = await PhoneParserUtility.getPhoneParser(
        phoneNumber,
        false,
      );
      countryCode = phoneParser ? phoneParser.getCountryCode() : countryCode;
    }
    return countryCode;
  }

  private async _getDialingPlanCountryRecordByISOCode(
    isoCode: string,
  ): Promise<UndefinedAble<DialingCountryInfo>> {
    const recordsInDialing = await this._getDialingPlanCountryRecords();
    const record = recordsInDialing.find(
      (x: DialingPlanCountryRecord) => x.isoCode === isoCode,
    );
    return record;
  }

  private _getDefaultCountryInfoByISOCode(isoCode: string) {
    const index = SELLING_COUNTRY_LIST.findIndex(
      (info: DialingCountryInfo) => info.isoCode === isoCode,
    );

    return index !== -1 ? SELLING_COUNTRY_LIST[index] : undefined;
  }

  private _getDefaultCountryInfoByCallingCode(callingCode: string) {
    const index = SELLING_COUNTRY_LIST.findIndex(
      (info: DialingCountryInfo) => info.callingCode === callingCode,
    );

    return index !== -1 ? SELLING_COUNTRY_LIST[index] : undefined;
  }

  private async _setStationLocation(setting: StationSetting) {
    const {
      newCountryInfo,
      updateSpecialNumber = true,
      areaCodeByManual = true,
      countryByManual = true,
    } = setting;
    let { areaCode } = setting;

    const stationSettingInDB = this._getStationLocation();
    if (
      stationSettingInDB &&
      !this._shouldUpdateRegion(countryByManual, stationSettingInDB)
    ) {
      mainLogger.tags(LOG_TAG).log('no need to update region');
      return;
    }

    let countryInfo = _.cloneDeep(newCountryInfo);
    const brandId =
      (await this._rcAccountInfoController.getAccountBrandId()) ||
      DefaultBrandId;
    const isATT =
      (await this._rcAccountInfoController.getBrandID2Type(brandId)) ===
      RCBrandType.ATT;

    if (isATT && countryInfo.id !== DefaultCountryInfo.id) {
      countryInfo = DefaultCountryInfo;
    }

    areaCode = await this._getRightAreaCode(
      countryInfo,
      areaCode,
      areaCodeByManual,
      stationSettingInDB,
    );

    const outboundCallPrefix = await this._rcAccountInfoController.getOutboundCallPrefix();
    const maxExtLen = await this._accountServiceInfoController.getMaxExtensionNumberLength();
    const shortExtLen = await this._accountServiceInfoController.getShortExtensionNumberLength();
    const siteCode = await this._getSiteCode();

    this._updateStationLocation({
      areaCodeByManual,
      areaCode,
      countryByManual,
      countryInfo: newCountryInfo,
    });

    this._updateCurrentCountryId(countryInfo);

    mainLogger
      .tags(LOG_TAG)
      .info('setStationLocation', { brandId, countryInfo, areaCode });

    try {
      await PhoneParserUtility.setStationLocation({
        siteCode,
        outboundCallPrefix,
        brandId: _.toInteger(brandId),
        szCountryCode: countryInfo.callingCode,
        szAreaCode: areaCode,
        maxShortLen: maxExtLen,
        shortPinLen: shortExtLen,
      });

      notificationCenter.emit(RC_INFO.RC_REGION_INFO);
    } catch (error) {
      mainLogger
        .tags(LOG_TAG)
        .log('PhoneParserUtility.setStationLocation', error);
    }

    updateSpecialNumber &&
      (await this._updateSpecialNumberIfNeed(_.toInteger(newCountryInfo.id)));

    const regionInfo: RegionInfo = {
      areaCode,
      countryCode: countryInfo.callingCode,
    };

    notificationCenter.emit(SERVICE.RC_INFO_SERVICE.REGION_UPDATED, regionInfo);
  }

  private _getStationLocation(): StationLocationSetting {
    const userId = AccountGlobalConfig.getUserDictionary() as number;
    const currentInfo =
      RCInfoGlobalConfig.getStationLocation() ||
      ({} as GlobalStationLocationSetting);
    return currentInfo[userId.toString()];
  }

  private _updateStationLocation(newRegionInfo: StationLocationSetting) {
    const userId = AccountGlobalConfig.getUserDictionary() as number;
    const currentInfo =
      RCInfoGlobalConfig.getStationLocation() ||
      ({} as GlobalStationLocationSetting);
    currentInfo[userId.toString()] = newRegionInfo;
    RCInfoGlobalConfig.setStationLocation(currentInfo);
  }

  private _shouldUpdateRegion(
    countryByManual: boolean,
    setting: StationLocationSetting,
  ) {
    return countryByManual || !setting.countryByManual;
  }

  private _shouldUpdateAreaCode(
    byManual: boolean,
    byManualInDB: boolean,
    areaCodeInDB: string,
  ) {
    if (byManual || !byManualInDB) {
      return { should: true, areaCode: '' };
    }
    return { should: false, areaCode: areaCodeInDB };
  }

  private async _getRightAreaCode(
    countryInfo: DialingCountryInfo,
    oldAreaCode: string,
    areaCodeByManual: boolean,
    stationSettingInDB?: StationLocationSetting,
  ) {
    if (this.hasAreaCode(countryInfo.callingCode)) {
      let areaCode = oldAreaCode;
      if (stationSettingInDB) {
        const checkResult = this._shouldUpdateAreaCode(
          areaCodeByManual,
          stationSettingInDB.areaCodeByManual,
          stationSettingInDB.areaCode,
        );
        areaCode = checkResult.should ? areaCode : checkResult.areaCode;
      }

      if (areaCodeByManual && areaCode.length === 0) {
        return areaCode;
      }

      let region = await PhoneParserUtility.getRegionalInfo(
        _.toInteger(countryInfo.id),
        areaCode,
      );
      if (areaCode.length === 0 || (region && region.HasBan())) {
        const areaCodeFromCallerId = await this._getAreaCodeFromUserNumbers();
        region = await PhoneParserUtility.getRegionalInfo(
          _.toInteger(countryInfo.id),
          areaCodeFromCallerId,
        );
      }
      return !region || region.HasBan() ? '' : region.areaCode;
    }

    return '';
  }

  private async _updateSpecialNumberIfNeed(countryId: number) {
    const specialNumber = await this._rcInfoFetchController.getSpecialNumberRuleByCountryId(
      countryId,
    );
    if (!specialNumber) {
      await this._rcInfoFetchController.requestSpecialNumberRule();
    }
  }

  private async _getSiteCode() {
    const extensionInfo = await this._rcInfoFetchController.getRCExtensionInfo();
    return (
      (extensionInfo && extensionInfo.site && extensionInfo.site.code) || ''
    );
  }

  private async _getAreaCodeFromUserNumbers(): Promise<string> {
    const phoneNumber = await this._validUserPhoneNumber();
    return (
      (phoneNumber &&
        phoneNumber.length &&
        (await this._getNonTollFreeNumberAreaCode(phoneNumber))) ||
      ''
    );
  }

  private async _validUserPhoneNumber() {
    return (
      (await this._firstDirectNumber()) || (await this._accountMainNumber())
    );
  }

  private async _accountMainNumber() {
    return await this._rcAccountInfoController.getAccountMainNumber();
  }

  private async _firstDirectNumber(): Promise<UndefinedAble<string>> {
    const callerIds = (await this._callerIdController.getCallerIdList()) || [];
    for (const callerId of callerIds) {
      if (
        callerId &&
        callerId.usageType === PhoneNumberType.DirectNumber &&
        callerId.phoneNumber
      ) {
        return callerId.phoneNumber;
      }
    }
    return undefined;
  }

  private async _getNonTollFreeNumberAreaCode(
    phoneNumber: string,
  ): Promise<UndefinedAble<string>> {
    const phoneParser = await PhoneParserUtility.getPhoneParser(
      phoneNumber,
      false,
    );

    if (
      !phoneParser ||
      phoneParser.isTollFree() ||
      phoneParser.getCountryId().toString() !== this._currentCountryInfo.id
    ) {
      return undefined;
    }
    return phoneParser.getAreaCode();
  }

  private _updateCurrentCountryId(countryInfo: DialingCountryInfo) {
    this._currentCountryInfo = countryInfo;
  }
}

export { RegionInfoController };
