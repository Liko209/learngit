/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-28 19:11:24
 * Copyright © RingCentral. All rights reserved.
 */

type SettingsKey = any;

type PhoneParserPath = any;

type RegionalInfo = {
  areaCode: string;
  HasBan: () => boolean;
};

type ServiceCodeType = {
  value: any;
};

type ServiceCodeTypeEnum = {
  enPDSFTUnknown: ServiceCodeType;
  enPDSFTBlockCLID: ServiceCodeType;
  enPDSFTCallback: ServiceCodeType;
  enPDSFTMainMenu: ServiceCodeType;
  enPDSFTSetAgentStatus: ServiceCodeType;
  enPDSFTIntercom: ServiceCodeType;
  enPDSFTParkPickup: ServiceCodeType;
  enPDSFTPaging: ServiceCodeType;
  enPDSFTMonitoring: ServiceCodeType;
  enPDSFTWhisper: ServiceCodeType;
  enPDSFTBargeIn: ServiceCodeType;
  enPDSFTTakeOver: ServiceCodeType;
  enPDSFTHotDeskLogin: ServiceCodeType;
  enPDSFTHotDeskLogout: ServiceCodeType;
  enPDSPTIVRScript: ServiceCodeType;
};

type PhoneParser = {
  GetE164Extended: (addDtmfPostfix: boolean) => string;
  GetE164TAS: (addDtmfPostfix: boolean) => string;
  GetCanonical: (fullView: boolean) => string;
  GetLocalCanonical: (fullView: boolean) => string;
  IsRCExtension: () => boolean;
  IsTollFree: () => boolean;
  IsSpecialNumber: () => boolean;
  GetServiceCodeType: () => ServiceCodeType;
  CheckValidForCountry: (checkAreaCodeExist: boolean) => boolean;
  GetSpecialPrefixMask: () => string;
  GetSpecialNumberTemplate: () => string;
  IsEmpty: () => boolean;
  GetNumber: () => string;
  GetCountryCode: () => string;
  GetAreaCode: () => string;
  GetCountryId: () => number;
  GetCountryName: () => string;
  GetDialable: (addDtmfPostfix: boolean) => string;
  GetDtmfPostfix: () => string;
};

type ModuleParams = {
  onRuntimeInitialized: () => void;
  readBinary?: (wasmBinaryFile: string) => any;
  locateFile?: (path: string, scriptDirectory: string) => string;
};

type ModuleClass = any;

type ModuleType = {
  NewSettingsKey: (settingsKey: string, brandId: number) => SettingsKey;
  NewPhoneParser: (szNumber: string, settingsKey: SettingsKey) => PhoneParser;
  ReadRootNodeByString: (xmlFile: string) => boolean;
  GetPhoneDataFileVersion: () => string;
  GetStationCountryCode: () => string;
  GetStationAreaCode: () => string;
  SetStationLocation: (
    szCountryCode: string,
    szAreaCode: string,
    brandId: number,
    maxShortLen: number,
    shortPstnPossible: boolean,
    siteCode: string,
    shortPinLen: number,
    outboundCallPrefix: string,
  ) => void;
  GetStationSettingsKey: () => SettingsKey;
  GetRegionalInfo: (countryId: number, areaCode: string) => RegionalInfo;
  EnPDServiceCodeType: ServiceCodeTypeEnum;
};

export {
  SettingsKey,
  PhoneParserPath,
  RegionalInfo,
  ServiceCodeType,
  PhoneParser,
  ModuleParams,
  ModuleClass,
  ModuleType,
};
