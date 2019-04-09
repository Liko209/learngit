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

type ISpecialServiceNumber = {
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

type IDialingPlan = {
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

type IExtensionPhoneNumberList = {
  uri: string;
  records: IPhoneNumberRecord[];
  paging: IPagingInfo;
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

export {
  RCCountryInfo,
  RCRegionalSetting,
  RCStatusInfo,
  ISpecialServiceRequest,
  ISpecialServiceNumber,
  IDialingPlanRequest,
  IDialingPlan,
  IPhoneNumberRequest,
  IExtensionPhoneNumberList,
  RCAPIVersion,
  ITokenModel,
};
