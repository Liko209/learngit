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
import notificationCenter from '../../service/notificationCenter';
import { RC_INFO } from '../../service/eventKey';
import { RCInfoService } from '../../module/rcInfo';

const MODULE_LOADING_TIME_OUT: number = 60000; // 1 minute
const PhoneParserModule: ModuleClass = Module;

class PhoneParserUtility {
  private static _phoneParserModule: ModuleType;
  private static _moduleLoadingTime: number = 0;
  private static _moduleLoaded: boolean = false;
  private static _initialized: boolean = false;
  private static _localPhoneDataLoaded: boolean = false;
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

    PhoneParserUtility.loadLocalPhoneData();
    try {
      PhoneParserUtility._moduleLoadingTime = Date.now();
      const params: ModuleParams = {
        onRuntimeInitialized: () => {
          PhoneParserUtility.onModuleLoaded();
        },
        locateFile: (fileName: string) => {
          return `/wasm/${fileName}`;
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
    PhoneParserUtility.initPhoneParser(false);
    notificationCenter.on(RC_INFO.PHONE_DATA, () => {
      PhoneParserUtility.initPhoneParser(true);
    });
  }

  static async loadLocalPhoneData(): Promise<void> {
    if (PhoneParserUtility._localPhoneDataLoaded) {
      return;
    }
    const rcInfoService: RCInfoService = RCInfoService.getInstance();
    if (await rcInfoService.getPhoneData()) {
      PhoneParserUtility._localPhoneDataLoaded = true;
      return;
    }
    fetch(localPhoneDataPath)
      .then(async (response: Response) => {
        if (!response.ok) {
          mainLogger.error('loadLocalPhoneData error', response);
          return;
        }
        const result = await response.text();
        if (result) {
          await rcInfoService.setPhoneData(result);
          PhoneParserUtility._localPhoneDataLoaded = true;
          PhoneParserUtility.initPhoneParser(true);
        }
      })
      .catch((error: any) => {
        mainLogger.error('loadLocalPhoneData error', error);
      });
  }

  static async initPhoneParser(force: boolean): Promise<boolean> {
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

    const rcInfoService: RCInfoService = RCInfoService.getInstance();
    const phoneData = await rcInfoService.getPhoneData();
    if (!phoneData || phoneData.length === 0) {
      mainLogger.debug('PhoneParserUtility: Storage phone data is invalid.');
      return false;
    }
    const result = PhoneParserUtility._phoneParserModule.ReadRootNodeByString(
      phoneData,
    );

    if (result) {
      await rcInfoService.setPhoneDataVersion(
        PhoneParserUtility._phoneParserModule.GetPhoneDataFileVersion(),
      );
    }

    PhoneParserUtility._initialized = result;
    mainLogger.debug('PhoneParserUtility: init result => ', result);
    return result;
  }

  static async canGetPhoneParser(): Promise<boolean> {
    return (
      PhoneParserUtility._initialized ||
      (await PhoneParserUtility.initPhoneParser(false))
    );
  }

  static async getPhoneParser(
    phoneNumber: string,
    useDefaultSettingsKey: boolean,
  ): Promise<PhoneParserUtility | undefined> {
    if (!(await PhoneParserUtility.canGetPhoneParser())) {
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

  static async getPhoneDataFileVersion(): Promise<string | undefined> {
    if (!(await PhoneParserUtility.canGetPhoneParser())) {
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

  static async getRegionalInfo(
    countryId: number,
    areaCode: string,
  ): Promise<RegionalInfo | undefined> {
    if (!(await PhoneParserUtility.canGetPhoneParser())) {
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
  async isEqualToPhoneNumber(phoneNumber: string): Promise<boolean> {
    const phoneParser = await PhoneParserUtility.getPhoneParser(
      phoneNumber,
      false,
    );
    if (!phoneParser) {
      return false;
    }
    return this.getE164() === phoneParser.getE164();
  }

  // should compare with main company number instead of dialing plan;
  async isInternationalDialing(): Promise<boolean> {
    // should not check international for special number;
    if (this.isShortNumber() || this.isServiceFeatureNumber()) {
      return false;
    }

    const rcInfoService: RCInfoService = RCInfoService.getInstance();
    const accountInfo = await rcInfoService.getRCAccountInfo();
    if (!accountInfo || !accountInfo.mainNumber) {
      mainLogger.debug('isInternationalDialing: can not get rc main number.');
      return false;
    }

    const mainNumberParser = await PhoneParserUtility.getPhoneParser(
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
}

export { PhoneParserUtility };
