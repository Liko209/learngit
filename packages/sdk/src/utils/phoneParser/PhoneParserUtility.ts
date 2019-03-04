/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-01 15:45:58
 * Copyright © RingCentral. All rights reserved.
 */

import {
  Module,
  localPhoneDataPath,
  SettingsKey,
  RegionalInfo,
  PhoneParser,
  ModuleParams,
  ModuleClass,
  ModuleType,
  mainLogger,
} from 'foundation';
import fs from 'fs';
import { RcInfoConfig } from '../../module/rcInfo/config';
import { RcAccountInfo } from '../../api/ringcentral/types/RcAccountInfo';

const MODULE_LOADING_TIME_OUT: number = 60000; // 1 minute
const PhoneParserModule: ModuleClass = Module;

class PhoneParserUtility {
  private static _phoneParserModule: ModuleType;
  private static _moduleLoadingTime: number = 0;
  private static _moduleLoaded: boolean = false;
  private static _initialized: boolean = false;
  private _phoneParser: PhoneParser;

  constructor(phoneNumber: string, settingsKey: SettingsKey) {
    this._phoneParser = PhoneParserUtility._phoneParserModule.NewPhoneParser(
      phoneNumber,
      settingsKey,
    );
  }

  static loadModule(): void {
    if (PhoneParserUtility._moduleLoaded) {
      return;
    }

    if (
      Date.now() - PhoneParserUtility._moduleLoadingTime <
      MODULE_LOADING_TIME_OUT
    ) {
      mainLogger.debug('PhoneParserUtility: module is loading...');
      return;
    }

    if (PhoneParserUtility._moduleLoadingTime !== 0) {
      mainLogger.error(
        'PhoneParserUtility: module load timeout, will try again.',
      );
    }

    try {
      PhoneParserUtility._moduleLoadingTime = Date.now();
      const params: ModuleParams = {
        onRuntimeInitialized: () => {
          PhoneParserUtility.onModuleLoaded();
        },
      };
      PhoneParserUtility._phoneParserModule = new PhoneParserModule(params);
    } catch (err) {
      mainLogger.error(
        `PhoneParserUtility: module failed to load, error: ${err}`,
      );
      PhoneParserUtility._moduleLoaded = false;
    }
  }

  static onModuleLoaded(): void {
    mainLogger.debug('PhoneParserUtility: module loaded successfully.');
    PhoneParserUtility._moduleLoaded = true;
  }

  static initPhoneParser(force: boolean): boolean {
    if (!PhoneParserUtility._moduleLoaded) {
      PhoneParserUtility.loadModule();
      return false;
    }

    if (force) {
      PhoneParserUtility._initialized = false;
    }

    if (PhoneParserUtility._initialized) {
      return true;
    }

    if (PhoneParserUtility._initByPhoneData(false)) {
      PhoneParserUtility._initialized = true;
      mainLogger.debug(
        'PhoneParserUtility: init successful by newest phone data.',
      );
      return true;
    }
    const result = PhoneParserUtility._initByPhoneData(true);
    PhoneParserUtility._initialized = result;
    mainLogger.debug('PhoneParserUtility: local init result => ', result);
    return result;
  }

  static getPhoneData(fromLocal: boolean): string | undefined {
    if (fromLocal) {
      try {
        return fs.readFileSync(localPhoneDataPath).toString();
      } catch (err) {
        mainLogger.error(
          `PhoneParserUtility: Can not get local phone data, error: ${err}`,
        );
        return undefined;
      }
    }

    const phoneData = RcInfoConfig.getRcPhoneData();
    if (!phoneData || phoneData.length === 0) {
      mainLogger.debug('PhoneParserUtility: Storage phone data is invalid.');
      return undefined;
    }
    return phoneData;
  }

  static canGetPhoneParser(): boolean {
    return (
      PhoneParserUtility._initialized ||
      PhoneParserUtility.initPhoneParser(false)
    );
  }

  static getPhoneParser(
    phoneNumber: string,
    useDefaultSettingsKey: boolean,
  ): PhoneParserUtility | undefined {
    if (!PhoneParserUtility.canGetPhoneParser()) {
      return undefined;
    }

    let settingsKey: SettingsKey;
    if (useDefaultSettingsKey) {
      settingsKey = PhoneParserUtility._phoneParserModule.NewSettingsKey(
        '1650',
        1210,
      );
    } else {
      settingsKey = PhoneParserUtility._phoneParserModule.GetStationSettingsKey();
    }
    return new PhoneParserUtility(phoneNumber, settingsKey);
  }

  static getPhoneDataFileVersion(): string | undefined {
    if (!PhoneParserUtility.canGetPhoneParser()) {
      return undefined;
    }
    return PhoneParserUtility._phoneParserModule.GetPhoneDataFileVersion();
  }

  static getStationCountryCode(): string | undefined {
    if (!PhoneParserUtility._moduleLoaded) {
      PhoneParserUtility.loadModule();
      return undefined;
    }
    return PhoneParserUtility._phoneParserModule.GetStationCountryCode();
  }

  static getStationAreaCode(): string | undefined {
    if (!PhoneParserUtility._moduleLoaded) {
      PhoneParserUtility.loadModule();
      return undefined;
    }
    return PhoneParserUtility._phoneParserModule.GetStationAreaCode();
  }

  static setStationLocation(
    szCountryCode: string,
    szAreaCode: string,
    brandId: number = 0,
    maxShortLen: number = -1,
    shortPstnPossible: boolean = false,
    siteCode: string = '',
    shortPinLen: number = 0,
    outboundCallPrefix: string = '',
  ): boolean {
    if (!PhoneParserUtility._moduleLoaded) {
      PhoneParserUtility.loadModule();
      return false;
    }

    PhoneParserUtility._phoneParserModule.SetStationLocation(
      szCountryCode,
      szAreaCode,
      brandId,
      maxShortLen,
      shortPstnPossible,
      siteCode,
      shortPinLen,
      outboundCallPrefix,
    );
    return true;
  }

  static getStationSettingsKey(): SettingsKey | undefined {
    if (!PhoneParserUtility._moduleLoaded) {
      PhoneParserUtility.loadModule();
      return undefined;
    }
    return PhoneParserUtility._phoneParserModule.GetStationSettingsKey();
  }

  static getRegionalInfo(
    countryId: number,
    areaCode: string,
  ): RegionalInfo | undefined {
    if (!PhoneParserUtility.canGetPhoneParser()) {
      return undefined;
    }
    return PhoneParserUtility._phoneParserModule.GetRegionalInfo(
      countryId,
      areaCode,
    );
  }

  static isStationUK(): boolean {
    return PhoneParserUtility.getStationCountryCode() === '44';
  }

  static isStationUSorCA(): boolean {
    return PhoneParserUtility.getStationCountryCode() === '1';
  }

  getE164(addDtmfPostfix: boolean = true): string {
    return this._phoneParser.GetE164Extended(addDtmfPostfix);
  }

  getE164TAS(addDtmfPostfix: boolean = false): string {
    return this._phoneParser.GetE164TAS(addDtmfPostfix);
  }

  getCanonical(fullView: boolean = true): string {
    return this._phoneParser.GetCanonical(fullView);
  }

  getLocalCanonical(fullView: boolean = true): string {
    return this._phoneParser.GetLocalCanonical(fullView);
  }

  isShortNumber(): boolean {
    return this._phoneParser.IsRCExtension();
  }

  isTollFree(): boolean {
    return this._phoneParser.IsTollFree();
  }

  isSpecialNumber(): boolean {
    return this._phoneParser.IsSpecialNumber();
  }

  isServiceFeatureNumber(): boolean {
    return (
      this._phoneParser.GetServiceCodeType().value !==
      PhoneParserUtility._phoneParserModule.EnPDServiceCodeType.enPDSFTUnknown
        .value
    );
  }

  checkValidForCountry(checkAreaCodeExist: boolean): boolean {
    return this._phoneParser.CheckValidForCountry(checkAreaCodeExist);
  }

  getSpecialPrefixMask(): string {
    return this._phoneParser.GetSpecialPrefixMask();
  }

  getSpecialNumberTemplate(): string {
    return this._phoneParser.GetSpecialNumberTemplate();
  }

  isEmpty(): boolean {
    return this._phoneParser.IsEmpty();
  }

  isValid(): boolean {
    return this._phoneParser.GetNumber().length !== 0;
  }

  // compare E164 format;
  isEqualToPhoneNumber(phoneNumber: string): boolean {
    const phoneParser = PhoneParserUtility.getPhoneParser(phoneNumber, false);
    if (!phoneParser) {
      return false;
    }
    return this.getE164() === phoneParser.getE164();
  }

  // should compare with main company number instead of dialing plan;
  isInternationalDialing(): boolean {
    // should not check international for special number;
    if (this.isShortNumber() || this.isServiceFeatureNumber()) {
      return false;
    }

    const accountInfo: RcAccountInfo = RcInfoConfig.getRcAccountInfo();
    if (!accountInfo || !accountInfo.mainNumber) {
      mainLogger.debug('isInternationalDialing: can not get rc main number.');
      return false;
    }

    const mainNumberParser = PhoneParserUtility.getPhoneParser(
      accountInfo.mainNumber,
      false,
    );
    if (!mainNumberParser) {
      return false;
    }

    if (
      (this.isUSAOrCanada() && mainNumberParser.isUSAOrCanada()) ||
      this.getCountryName() === mainNumberParser.getCountryName()
    ) {
      return false;
    }
    return true;
  }

  getCountryCode(): string {
    return this._phoneParser.GetCountryCode();
  }

  getAreaCode(): string {
    return this._phoneParser.GetAreaCode();
  }

  getCountryId(): number {
    return this._phoneParser.GetCountryId();
  }

  isUSAOrCanada(): boolean {
    const countryId = this.getCountryId();
    return countryId === 1 || countryId === 39;
  }

  getCountryName(): string {
    return this._phoneParser.GetCountryName();
  }

  getDialableNumber(): string {
    return this._phoneParser.GetDialable(false);
  }

  getNumber(): string {
    return this._phoneParser.GetNumber();
  }

  // Return DTMF postfix (part of comas and digits after first coma)
  getDtmfPostfix(): string {
    return this._phoneParser.GetDtmfPostfix();
  }

  private static _initByPhoneData(fromLocal: boolean): boolean {
    const phoneData = PhoneParserUtility.getPhoneData(fromLocal);
    return (
      phoneData !== undefined &&
      PhoneParserUtility._phoneParserModule.ReadRootNodeByString(phoneData)
    );
  }
}

export { PhoneParserUtility };
