/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 13:54:41
 * Copyright © RingCentral. All rights reserved.
 */

type RcCountryInfo = {
  uri?: string;
  id?: string;
  name?: string;
  isoCode?: string;
  callingCode?: string;
  emergencyCalling?: boolean;
};

type RcTimezoneInfo = {
  uri?: string;
  id?: string;
  name?: string;
  description?: string;
};

type RcLanguageInfo = {
  uri?: string;
  id?: string;
  greeting?: boolean;
  formattingLocale?: boolean;
  localeCode?: string;
  name?: string;
  ui?: string;
};

type RcGreetingLanguageInfo = {
  id?: string;
  localeCode?: string;
  name?: string;
};

type RcFormattingLocalInfo = {
  id?: string;
  localeCode?: string;
  name?: string;
};

type RcRegionalSetting = {
  homeCountry?: RcCountryInfo;
  timezone?: RcTimezoneInfo;
  language?: RcLanguageInfo;
  greetingLanguage?: RcGreetingLanguageInfo;
  formattingLocale?: RcFormattingLocalInfo;
  timeFormat?: string;
};

type RcStatusInfo = {
  comment?: string;
  reason?: string;
};

type ISpecialServiceReason = {
  id: string;
  message: string;
};

type ISpecialServiceFeature = {
  enabled: boolean;
  reason: ISpecialServiceReason;
};

type ISpecialServiceRecord = {
  phoneNumber: string;
  description: string;
  features: {
    voip: ISpecialServiceFeature;
    ringOut: ISpecialServiceFeature;
    sms: ISpecialServiceFeature;
    faxOut: ISpecialServiceFeature;
  };
};

type IUriInfo = {
  uri: string;
};

type IPagingInfo = {
  page: number;
  totalPages: number;
  perPage: number;
  totalElements: number;
  pageStart: number;
  pageEnd: number;
};

type INavigationInfo = {
  firstPage: IUriInfo;
  lastPage: IUriInfo;
};

type ISpecialServiceNumberResponse = {
  uri: string;
  records: ISpecialServiceRecord[];
  paging: IPagingInfo;
  navigation: INavigationInfo;
};

type ISpecialServiceRequest = {
  page: number;
  perPage: number;
  countryId: number;
};

type IDialingPlanRequest = {
  page: number;
  perPage: number;
};

type IDialingPlanRecord = {
  uri: string;
  id: string;
  name: string;
  isoCode: string;
  callingCode: string;
};

type IDialingPlanResponse = {
  uri: string;
  records: IDialingPlanRecord[];
  paging: IPagingInfo;
  navigation: INavigationInfo;
};

type IPhoneNumberRequest = {
  usageType: string;
  page: number;
  perPage: number;
};

type ICountryInfo = {
  uri: string;
  id: string;
  name: string;
};

type IPhoneNumberRecord = {
  id: number;
  phoneNumber: string;
  paymentType: string;
  type: string;
  usageType: string;
  status: string;
  country: ICountryInfo;
  features: string[];
};

type IPhoneNumberResponse = {
  uri: string;
  records: IPhoneNumberRecord[];
  paging: IPagingInfo;
  navigation: INavigationInfo;
};

type RcVersionInfo = {
  uri: string;
  versionString: string;
  releaseDate: string;
  uriString: string;
};

type RcAPIVersion = {
  uri: string;
  apiVersions: RcVersionInfo[];
  serverVersion: string;
  serverRevision: string;
};

export {
  RcCountryInfo,
  RcRegionalSetting,
  RcStatusInfo,
  ISpecialServiceRequest,
  ISpecialServiceNumberResponse,
  IDialingPlanRequest,
  IDialingPlanResponse,
  IPhoneNumberRequest,
  IPhoneNumberResponse,
  RcAPIVersion,
};
