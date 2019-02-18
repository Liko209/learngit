/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-14 11:03:43
 * Copyright © RingCentral. All rights reserved.
 */
import { RINGCENTRAL_API, HTTP_HEADER_KEY, CONTENT_TYPE } from './constants';
import { NETWORK_METHOD, NETWORK_VIA } from 'foundation';
import Api from '../api';

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

function getSpecialNumbers(request?: ISpecialServiceRequest) {
  const query = {
    path: RINGCENTRAL_API.API_SPECIAL_SERVICE_NUMBER,
    method: NETWORK_METHOD.GET,
    authFree: false,
    via: NETWORK_VIA.HTTP,
    params: request,
  };
  return Api.rcNetworkClient.http<ISpecialServiceNumberResponse>(query);
}

function getPhoneParserData(localDataVersion: string) {
  const extraHeaders = {};
  const localDataVersionWithQuote = `\"${localDataVersion}\"`;
  extraHeaders[HTTP_HEADER_KEY.ACCEPT] = CONTENT_TYPE.XML;
  extraHeaders[HTTP_HEADER_KEY.IF_NONE_MATCH] = localDataVersionWithQuote;
  const query = {
    path: RINGCENTRAL_API.API_PHONE_PARSER_DATA,
    method: NETWORK_METHOD.GET,
    authFree: false,
    via: NETWORK_VIA.HTTP,
    headers: extraHeaders,
  };
  return Api.rcNetworkClient.http(query);
}

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

function getAccountDialingPlan(request?: IDialingPlanRequest) {
  const query = {
    path: RINGCENTRAL_API.API_DIALING_PLAN,
    method: NETWORK_METHOD.GET,
    authFree: false,
    via: NETWORK_VIA.HTTP,
    params: request,
  };
  return Api.rcNetworkClient.http<IDialingPlanResponse>(query);
}

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

function getExtensionPhoneNumberList(request?: IPhoneNumberRequest) {
  const query = {
    path: RINGCENTRAL_API.API_EXTENSION_PHONE_NUMBER,
    method: NETWORK_METHOD.GET,
    authFree: false,
    via: NETWORK_VIA.HTTP,
    params: request,
  };
  return Api.rcNetworkClient.http<IPhoneNumberResponse>(query);
}

export {
  ISpecialServiceRequest,
  getSpecialNumbers,
  getPhoneParserData,
  IDialingPlanRequest,
  getAccountDialingPlan,
  IPhoneNumberRequest,
  getExtensionPhoneNumberList,
};
