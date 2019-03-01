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
  enPDSFTUnknown: { value: any };
  enPDSFTBlockCLID: { value: any };
  enPDSFTCallback: { value: any };
  enPDSFTMainMenu: { value: any };
  enPDSFTSetAgentStatus: { value: any };
  enPDSFTIntercom: { value: any };
  enPDSFTParkPickup: { value: any };
  enPDSFTPaging: { value: any };
  enPDSFTMonitoring: { value: any };
  enPDSFTWhisper: { value: any };
  enPDSFTBargeIn: { value: any };
  enPDSFTTakeOver: { value: any };
  enPDSFTHotDeskLogin: { value: any };
  enPDSFTHotDeskLogout: { value: any };
  enPDSPTIVRScript: { value: any };
};

type PhoneParser = {
  GetE164Extended: (addDtmfPostfix: boolean) => string;
  GetE164TAS: () => string;
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
  GetDialable: (addDtmfPostfix: boolean) => string; // addDtmfPostfix = false by default
  GetDtmfPostfix: () => string;
};

type ModuleParams = {
  onRuntimeInitialized: () => void;
};

type ModuleClass = any;

type ModuleType = {
  NewSettingsKey: (settingsKey: string, brandId: number) => SettingsKey;
  NewPhoneParser: (szNumber: string, settingsKey: SettingsKey) => PhoneParser;
  // NewPath: (path: string) => PhoneParserPath; // will extension
  // ReadRootNode: (filePath: string, pString: string) => boolean; // will extension
  ReadRootNodeByString: (xmlFile: string, pString: string) => boolean;
  // SetDefaultPhoneDataDirectory: (path: PhoneParserPath) => void; // will extension
  GetPhoneDataFileVersion: () => string;
  GetStationCountryArea: (country: string, area: string) => void;
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
  EnPDServiceCodeType: ServiceCodeType;
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
