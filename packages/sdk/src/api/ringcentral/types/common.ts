/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-19 13:54:41
 * Copyright © RingCentral. All rights reserved.
 */

import { Token } from 'foundation/network';
import { IdModel } from 'sdk/framework/model';

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
  nextPage?: IUriInfo;
  previousPage?: IUriInfo;
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

type IStateRequest = {
  page: number;
  perPage: number;
  countryId: string;
};

type StateCountryInfo = {
  uri: string;
  id: string;
};

type StateInfo = {
  id: string;
  name: string;
  isoCode: string;
  country: StateCountryInfo;
};

type StateRecord = StateInfo & {
  uri: string;
};

type CountryState = {
  uri: string;
  records: StateRecord[];
  paging: PagingInfo;
  navigation: INavigationInfo;
};

type IPhoneNumberRequest = IForwardingNumberRequest & {
  usageType?: string;
};

type IForwardingNumberRequest = {
  page?: number;
  perPage?: number;
};

type ICountryInfo = {
  uri: string;
  id: string;
  name: string;
};

type ICountryRequest = {
  page: number;
  perPage: number;
};

type CountryRecord = {
  callingCode: string;
  emergencyCalling: boolean;
  freeSoftphoneLine: boolean;
  id: string;
  isoCode: string;
  loginAllowed: boolean;
  name: string;
  numberSelling: boolean;
  signupAllowed: boolean;
  uri: string;
};

type CountryList = {
  uri: string;
  records: CountryRecord[];
  paging: PagingInfo;
  navigation: INavigationInfo;
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
  label?: string;
};

type IExtensionPhoneNumberList = {
  uri: string;
  records: IPhoneNumberRecord[];
  paging: PagingInfo;
  navigation: INavigationInfo;
};

type IExtensionCallerFeature = {
  feature: string;
  callerId: {
    type: string;
    phoneInfo: {
      id: string;
      uri: string;
      phoneNumber?: string;
    };
  };
};
type IExtensionCallerFeatureRequest = {
  feature: string;
  callerId: {
    type?: string;
    phoneInfo?: {
      id: string;
    };
  };
};
// add type IdModel for partialModifyController
type IExtensionCallerId = IdModel<string> & {
  uri: string;
  byDevice: [];
  byFeature: IExtensionCallerFeature[];
  extensionNameForOutboundCalls?: boolean;
  extensionNumberForInternalCalls?: boolean;
};

type IExtensionCallerIdRequest = {
  byFeature: IExtensionCallerFeatureRequest[];
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
  IUriInfo,
  INavigationInfo,
  PagingInfo,
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
  IPhoneNumberRecord,
  IExtensionPhoneNumberList,
  IExtensionCallerIdRequest,
  IExtensionCallerFeatureRequest,
  IExtensionCallerFeature,
  IExtensionCallerId,
  RCAPIVersion,
  ITokenModel,
  RCServicePlanInfo,
  RCBillingPlanInfo,
  RCServiceFeature,
  RCBrandInfo,
  RCAuthCodeInfo,
  IForwardingNumberRequest,
  ICountryInfo,
  CountryState,
  StateRecord,
  IStateRequest,
  ICountryRequest,
  CountryList,
  CountryRecord,
};
