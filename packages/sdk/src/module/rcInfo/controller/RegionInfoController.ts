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
} from 'sdk/api/ringcentral/types';
import { PhoneParserUtility } from 'sdk/utils/phoneParser';
import { RCInfoFetchController } from './RCInfoFetchController';
import { RCAccountInfoController } from './RCAccountInfoController';
import { SELLING_COUNTRY_LIST, SUPPORT_AREA_CODE_COUNTRIES } from './constants';
import { RCBrandType, StationLocationSetting } from '../types';
import { AccountServiceInfoController } from './AccountServiceInfoController';
import { mainLogger } from 'foundation';

type StationSetting = {
  newCountryInfo: DialingCountryInfo;
  areaCode: string;
  updateSpecialNumber?: boolean;
  areaCodeByManual?: boolean;
  countryByManual?: boolean;
  updateDB?: boolean;
};
const LOG_TAG = 'RegionInfoController';
const DefaultCountryInfo = {
  id: '1',
  name: 'United States',
  isoCode: 'US',
  callingCode: '1',
};

class RegionInfoController {
  private _currentCountryInfo: DialingCountryInfo;

  constructor(
    private _rcInfoFetchController: RCInfoFetchController,
    private _rcAccountInfoController: RCAccountInfoController,
    private _accountServiceInfoController: AccountServiceInfoController,
  ) {}

  async loadRegionInfo() {
    const stationSetting = await this._rcInfoFetchController.getStationLocation();
    const countryInfo =
      (stationSetting && stationSetting.countryInfo) || DefaultCountryInfo;
    this._updateCurrentCountryId(countryInfo);
    await this._setStationLocation({
      newCountryInfo: countryInfo,
      areaCode: '',
      updateSpecialNumber: false,
      areaCodeByManual: false,
      countryByManual: false,
      updateDB: false,
    });
  }

  async getCountryList(): Promise<DialingCountryInfo[]> {
    const list = await this._getDialingPlanCountryRecords();
    if (list.length === 0) {
      const countryInfo = await this._getCountryFromAccountInfo();
      if (countryInfo) {
        list.push(countryInfo);
      }
    }
    return list;
  }

  async getCurrentCountry(): Promise<DialingCountryInfo> {
    if (this._currentCountryInfo === undefined) {
      await this.loadRegionInfo();
    }

    const countryInfo = await this._getDialingPlanCountryRecordByISOCode(
      this._currentCountryInfo.isoCode,
    );

    return countryInfo || (await this._getCountryFromAccountInfo())!;
  }

  async setDefaultCountry(isoCode: string) {
    const countryInfo =
      (await this._getDialingPlanCountryRecordByISOCode(isoCode)) ||
      (await this._getCountryFromAccountInfo());

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
    await this._setStationLocation({ areaCode, newCountryInfo: info });
  }

  async getAreaCode() {
    return PhoneParserUtility.getStationAreaCode();
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

  private async _getCountryFromAccountInfo() {
    const callingCodeFromMainNumber = await this._getAccountMainNumberCountryCode();
    return await this._getCountryFromDefaultSellingCountries(
      callingCodeFromMainNumber,
    );
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

  private async _getAccountMainNumberCountryCode(): Promise<string> {
    let countryCode = DefaultCountryInfo.callingCode; // default country
    const mainNumber = await this._rcAccountInfoController.getAccountMainNumber();
    if (mainNumber) {
      const phoneParser = await PhoneParserUtility.getPhoneParser(
        mainNumber,
        false,
      );
      countryCode =
        (phoneParser && phoneParser.getCountryCode()) || countryCode;
    }
    return countryCode;
  }

  private async _getDialingPlanCountryRecordByISOCode(
    isoCode: string,
  ): Promise<UndefinedAble<DialingCountryInfo>> {
    const recordsInDialing = await this._getDialingPlanCountryRecords();
    const record = recordsInDialing.find((x: DialingPlanCountryRecord) => {
      return x.isoCode === isoCode;
    });
    return record;
  }

  private _getDefaultCountryInfoByISOCode(isoCode: string) {
    const index = SELLING_COUNTRY_LIST.findIndex((info: DialingCountryInfo) => {
      return info.isoCode === isoCode;
    });

    return index !== -1 ? SELLING_COUNTRY_LIST[index] : undefined;
  }

  private _getDefaultCountryInfoByCallingCode(callingCode: string) {
    const index = SELLING_COUNTRY_LIST.findIndex((info: DialingCountryInfo) => {
      return info.callingCode === callingCode;
    });

    return index !== -1 ? SELLING_COUNTRY_LIST[index] : undefined;
  }

  private async _setStationLocation(setting: StationSetting) {
    const {
      newCountryInfo,
      updateSpecialNumber = true,
      areaCodeByManual = true,
      countryByManual = true,
      updateDB = true,
    } = setting;
    let { areaCode } = setting;

    const stationSettingInDB = await this._rcInfoFetchController.getStationLocation();
    if (
      stationSettingInDB &&
      !this._shouldUpdateRegion(countryByManual, stationSettingInDB)
    ) {
      return;
    }

    let countryInfo = _.cloneDeep(newCountryInfo);
    const brandId = await this._rcAccountInfoController.getAccountBrandId();
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

    updateDB &&
      this._rcInfoFetchController.setStationLocation({
        areaCodeByManual,
        areaCode,
        countryByManual,
        countryInfo: newCountryInfo,
      });

    this._updateCurrentCountryId(countryInfo);

    mainLogger
      .tags(LOG_TAG)
      .info('setStationLocation', { brandId, countryInfo, areaCode });

    PhoneParserUtility.setStationLocation({
      siteCode,
      outboundCallPrefix,
      brandId: _.toInteger(brandId),
      szCountryCode: countryInfo.callingCode,
      szAreaCode: areaCode,
      maxShortLen: maxExtLen,
      shortPinLen: shortExtLen,
    });

    updateSpecialNumber &&
      (await this._updateSpecialNumberIfNeed(_.toInteger(newCountryInfo.id)));
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

      let region = await PhoneParserUtility.getRegionalInfo(
        _.toInteger(countryInfo.id),
        areaCode,
      );
      if (areaCode.length === 0 || (region && region.HasBan())) {
        const areaCodeFromCallerId = await this._getAreaCodeFromCallerIds();
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

  private async _getAreaCodeFromCallerIds() {
    return (
      (await this._getAreaCodeFromUserCallerIds()) ||
      (await this._getAreaCodeFromAccountMainNumber())
    );
  }

  private async _getAreaCodeFromUserCallerIds(): Promise<
    UndefinedAble<string>
  > {
    // TODO:  get real caller ids and refine types and hard code, ticket FIJI-5538
    const callerIds = [] as any;
    for (const callerId of callerIds) {
      if (callerId && callerId.type === 'DID' && callerId.phoneNumber) {
        return this._getNonTollFreeNumberAreaCode(callerId.phoneNumber);
      }
    }

    return undefined;
  }

  private async _getAreaCodeFromAccountMainNumber() {
    const mainNumber = await this._rcAccountInfoController.getAccountMainNumber();
    return (
      (mainNumber && (await this._getNonTollFreeNumberAreaCode(mainNumber))) ||
      ''
    );
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
