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
} from 'foundation/telephony';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import notificationCenter from '../../service/notificationCenter';
import { RC_INFO, SERVICE } from '../../service/eventKey';
import { RCInfoService } from '../../module/rcInfo';
import { ServiceLoader, ServiceConfig } from '../../module/serviceLoader';
import { StationSettingInfo } from './types';
import { UndefinedAble } from 'sdk/types';
import { MODULE_STATUS, COUNTRY_CODE } from './constants';
import { PHONE_PARSER_PERFORMANCE_KEYS } from './config/performanceKeys';

const PhoneParserModule: ModuleClass = Module;

class PhoneParserUtility {
  private static _phoneParserModule: ModuleType;
  private static _moduleStatus: MODULE_STATUS = MODULE_STATUS.IDLE;
  private static _readPhoneDataStatus: MODULE_STATUS = MODULE_STATUS.IDLE;
  private static _readPhoneDataQueue: ((status: boolean) => void)[] = [];
  private static _loadingQueue: ((status: boolean) => void)[] = [];
  private static _initialized: boolean = false;
  private static _localPhoneDataLoaded: boolean = false;
  private _phoneParser: PhoneParser;

  constructor(phoneNumber: string, settingsKey: SettingsKey) {
    this._phoneParser = PhoneParserUtility._phoneParserModule.NewPhoneParser(
      phoneNumber,
      settingsKey,
    );
  }

  static triggerInitPhoneParser = () => {
    PhoneParserUtility.initPhoneParser(true);
  };

  static async loadModule(): Promise<boolean> {
    if (PhoneParserUtility._moduleStatus === MODULE_STATUS.LOADED) {
      return true;
    }

    if (PhoneParserUtility._moduleStatus === MODULE_STATUS.LOADING) {
      return new Promise<boolean>(resolve => {
        this._loadingQueue.push(resolve);
      });
    }

    notificationCenter.on(
      RC_INFO.PHONE_DATA,
      PhoneParserUtility.triggerInitPhoneParser,
    );

    notificationCenter.on(
      SERVICE.RC_LOGIN,
      PhoneParserUtility.triggerInitPhoneParser,
    );

    const performanceTracer = PerformanceTracer.start();

    return new Promise<boolean>(resolve => {
      PhoneParserUtility._moduleStatus = MODULE_STATUS.LOADING;
      const params: ModuleParams = {
        onRuntimeInitialized: () => {
          mainLogger.debug('PhoneParserUtility: module loaded successfully.');
          PhoneParserUtility._moduleStatus = MODULE_STATUS.LOADED;
          performanceTracer.end({
            key: PHONE_PARSER_PERFORMANCE_KEYS.LOAD_PHONE_PARSER,
            infos: true,
          });
          resolve(true);
          PhoneParserUtility._loadingQueue.forEach(resolve => {
            resolve(true);
          });
          PhoneParserUtility._loadingQueue = [];
          PhoneParserUtility.loadLocalPhoneData().catch(err => {
            mainLogger.warn(
              `PhoneParserUtility: loadLocalPhoneData error: ${err}`,
            );
          });
        },
        locateFile: (fileName: string) => `/wasm/${fileName}`,
      };
      PhoneParserUtility._phoneParserModule = new PhoneParserModule(params);
    }).catch(err => {
      mainLogger.warn(
        `PhoneParserUtility: module failed to load, error: ${err}`,
      );
      PhoneParserUtility._moduleStatus = MODULE_STATUS.IDLE;
      performanceTracer.end({
        key: PHONE_PARSER_PERFORMANCE_KEYS.LOAD_PHONE_PARSER,
        infos: false,
      });

      notificationCenter.off(
        RC_INFO.PHONE_DATA,
        PhoneParserUtility.triggerInitPhoneParser,
      );

      notificationCenter.off(
        SERVICE.RC_LOGIN,
        PhoneParserUtility.triggerInitPhoneParser,
      );

      PhoneParserUtility._loadingQueue.forEach(resolve => {
        resolve(false);
      });
      PhoneParserUtility._loadingQueue = [];
      return false;
    });
  }

  static async loadLocalPhoneData(): Promise<void> {
    if (PhoneParserUtility._localPhoneDataLoaded) {
      return;
    }
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
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
        }
      })
      .catch((error: any) => {
        mainLogger.error('loadLocalPhoneData error', error);
      });
  }

  static async initPhoneParser(force: boolean): Promise<boolean> {
    if (!(await PhoneParserUtility.loadModule())) {
      return false;
    }

    if (force) {
      PhoneParserUtility._initialized = false;
      PhoneParserUtility._readPhoneDataStatus = MODULE_STATUS.IDLE;
    }

    if (PhoneParserUtility._initialized) {
      return true;
    }

    if (PhoneParserUtility._readPhoneDataStatus === MODULE_STATUS.LOADING) {
      return new Promise<boolean>(resolve => {
        PhoneParserUtility._readPhoneDataQueue.push(resolve);
      });
    }
    PhoneParserUtility._readPhoneDataStatus = MODULE_STATUS.LOADING;

    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const phoneData = await rcInfoService.getPhoneData();
    if (!phoneData || phoneData.length === 0) {
      mainLogger.debug('PhoneParserUtility: Storage phone data is invalid.');
      this._notifyReadPhoneDataFinished(false);
      return false;
    }

    const performanceTracer = PerformanceTracer.start();

    return new Promise<boolean>(async resolve => {
      const result = PhoneParserUtility._phoneParserModule.ReadRootNodeByString(
        phoneData,
      );

      PhoneParserUtility._initialized = result;
      mainLogger.debug('PhoneParserUtility: init result => ', result);

      if (result) {
        await rcInfoService.setPhoneDataVersion(
          PhoneParserUtility._phoneParserModule.GetPhoneDataFileVersion(),
        );
        await rcInfoService.loadRegionInfo();
      }

      PhoneParserUtility._notifyReadPhoneDataFinished(result);
      performanceTracer.end({
        key: PHONE_PARSER_PERFORMANCE_KEYS.INIT_PHONE_PARSER,
        infos: result,
      });

      return resolve(result);
    }).catch(err => {
      mainLogger.warn('PhoneParserUtility: init error: ', err);
      performanceTracer.end({
        key: PHONE_PARSER_PERFORMANCE_KEYS.INIT_PHONE_PARSER,
        infos: false,
      });

      PhoneParserUtility._notifyReadPhoneDataFinished(false);
      return false;
    });
  }

  private static _notifyReadPhoneDataFinished(isSuccess: boolean) {
    PhoneParserUtility._readPhoneDataQueue.forEach(resolve => {
      resolve(isSuccess);
    });
    PhoneParserUtility._readPhoneDataQueue = [];
    PhoneParserUtility._readPhoneDataStatus = isSuccess
      ? MODULE_STATUS.LOADED
      : MODULE_STATUS.IDLE;
  }

  static async canGetPhoneParser(): Promise<boolean> {
    return (
      PhoneParserUtility._initialized ||
      (await PhoneParserUtility.initPhoneParser(false))
    );
  }

  static async getPhoneParser(
    phoneNumber: string,
    useDefaultSettingsKey = false,
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

  static async getPhoneDataFileVersion(): Promise<UndefinedAble<string>> {
    if (!(await PhoneParserUtility.canGetPhoneParser())) {
      return undefined;
    }
    return PhoneParserUtility._phoneParserModule.GetPhoneDataFileVersion();
  }

  static async getStationCountryCode(): Promise<UndefinedAble<string>> {
    if (!(await PhoneParserUtility.loadModule())) {
      return undefined;
    }
    return PhoneParserUtility._phoneParserModule.GetStationCountryCode();
  }

  static async getStationAreaCode(): Promise<UndefinedAble<string>> {
    if (!(await PhoneParserUtility.loadModule())) {
      return undefined;
    }
    return PhoneParserUtility._phoneParserModule.GetStationAreaCode();
  }

  static async setStationLocation(info: StationSettingInfo): Promise<boolean> {
    const {
      szCountryCode,
      szAreaCode,
      brandId = 0,
      maxShortLen = -1,
      shortPstnPossible = false,
      siteCode = '',
      shortPinLen = 0,
      outboundCallPrefix = '',
    } = info;
    if (!(await PhoneParserUtility.loadModule())) {
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

  static async getStationSettingsKey(): Promise<SettingsKey> {
    if (!(await PhoneParserUtility.loadModule())) {
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

  static async isAreaCodeValid(countryId: number, areaCode: string) {
    const regionalInfo = await PhoneParserUtility.getRegionalInfo(
      countryId,
      areaCode,
    );
    return regionalInfo ? !regionalInfo.HasBan() : false;
  }

  static async isStationUK(): Promise<boolean> {
    return (
      (await PhoneParserUtility.getStationCountryCode()) === COUNTRY_CODE.UK
    );
  }

  static async isStationUSorCA(): Promise<boolean> {
    return (
      (await PhoneParserUtility.getStationCountryCode()) ===
      COUNTRY_CODE.US_OR_CA
    );
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

    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
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
