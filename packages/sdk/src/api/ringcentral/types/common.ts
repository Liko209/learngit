/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 13:54:41
 * Copyright © RingCentral. All rights reserved.
 */

import { Token } from 'foundation';

type RCCountryInfo = {
  uri?: string;
  id?: string;
  name?: string;
  isoCode?: string;
  callingCode?: string;
  emergencyCalling?: boolean;
};

type RCTimezoneInfo = {
  uri?: string;
  id?: string;
  name?: string;
  description?: string;
};

type RCLanguageInfo = {
  uri?: string;
  id?: string;
  greeting?: boolean;
  formattingLocale?: boolean;
  localeCode?: string;
  name?: string;
  ui?: string;
};

type RCGreetingLanguageInfo = {
  id?: string;
  localeCode?: string;
  name?: string;
};

type RCFormattingLocalInfo = {
  id?: string;
  localeCode?: string;
  name?: string;
};

type RCRegionalSetting = {
  homeCountry?: RCCountryInfo;
  timezone?: RCTimezoneInfo;
  language?: RCLanguageInfo;
  greetingLanguage?: RCGreetingLanguageInfo;
  formattingLocale?: RCFormattingLocalInfo;
  timeFormat?: string;
};

type RCStatusInfo = {
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

type PagingInfo = {
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

type ISpecialServiceNumber = {
  uri: string;
  records: ISpecialServiceRecord[];
  paging: PagingInfo;
  navigation: INavigationInfo;
};

type ISpecialServiceRequest = {
  page?: number;
  perPage?: number;
  countryId: number;
};

type IDialingPlanRequest = {
  page: number;
  perPage: number;
};

type DialingCountryInfo = {
  id: string;
  name: string;
  isoCode: string;
  callingCode: string;
};

type DialingPlanCountryRecord = DialingCountryInfo & {
  uri: string;
};

type DialingPlan = {
  uri: string;
  records: DialingPlanCountryRecord[];
  paging: PagingInfo;
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

type IExtensionPhoneNumberList = {
  uri: string;
  records: IPhoneNumberRecord[];
  paging: PagingInfo;
  navigation: INavigationInfo;
};

type RCVersionInfo = {
  uri: string;
  versionString: string;
  releaseDate: string;
  uriString: string;
};

type RCAPIVersion = {
  uri: string;
  apiVersions: RCVersionInfo[];
  serverVersion: string;
  serverRevision: string;
};

type RCAuthCodeInfo = {
  uri: string;
  code: string;
};

interface ITokenModel extends Token {
  access_token: string;
  endpoint_id: string;
  expires_in: number;
  owner_id: string;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope: string;
  token_type: string;
}

type RCServicePlanInfo = {
  id?: string;
  name?: string;
  edition?: string;
};

type RCBillingPlanInfo = {
  id?: string;
  name?: string;
  durationUnit?: string;
  duration?: number;
  type?: string;
  includedPhoneLines?: number;
};

type RCServiceFeature = {
  enabled?: boolean;
  featureName: string;
  reason?: string;
};

type RCBrandInfo = {
  id?: string;
  name?: string;
  homeCountry?: RCCountryInfo;
};

export {
  RCCountryInfo,
  RCRegionalSetting,
  RCStatusInfo,
  ISpecialServiceRequest,
  ISpecialServiceNumber,
  IDialingPlanRequest,
  DialingPlan,
  DialingPlanCountryRecord,
  DialingCountryInfo,
  IPhoneNumberRequest,
  IExtensionPhoneNumberList,
  RCAPIVersion,
  ITokenModel,
  RCServicePlanInfo,
  RCBillingPlanInfo,
  RCServiceFeature,
  RCBrandInfo,
  RCAuthCodeInfo,
};
