/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-14 11:03:43
 * Copyright © RingCentral. All rights reserved.
 */
import { RINGCENTRAL_API } from './constants';
import { NETWORK_METHOD, NETWORK_VIA } from 'foundation';
import Api from '../api';

interface ISpecialServiceReason {
  id: string;
  message: string;
}

interface ISpecialServiceFeature {
  enabled: boolean;
  reason: ISpecialServiceReason;
}

interface ISpecialServiceRecord {
  phoneNumber: string;
  description: string;
  features: {
    voip: ISpecialServiceFeature;
    ringOut: ISpecialServiceFeature;
    sms: ISpecialServiceFeature;
    faxOut: ISpecialServiceFeature;
  };
}

interface IUriInfo {
  uri: string;
}

interface IPagingInfo {
  page: number;
  totalPages: number;
  perPage: number;
  totalElements: number;
  pageStart: number;
  pageEnd: number;
}

interface INavigationInfo {
  firstPage: IUriInfo;
  lastPage: IUriInfo;
}

interface ISpecialServiceNumberResponse {
  uri: string;
  records: ISpecialServiceRecord[];
  paging: IPagingInfo;
  navigation: INavigationInfo;
}

interface ISpecialServiceRequest {
  page: number;
  perPage: number;
  countryId: number;
}

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
  const ContentTypeXML = 'application/xml';
  const localDataVersionWithQuote = `\"${localDataVersion}\"`;
  const query = {
    path: RINGCENTRAL_API.API_PHONE_PARSER_DATA,
    method: NETWORK_METHOD.GET,
    authFree: false,
    via: NETWORK_VIA.HTTP,
    headers: {
      Accept: ContentTypeXML,
      'If-None-Match': localDataVersionWithQuote,
    },
  };
  return Api.rcNetworkClient.http(query);
}

interface IDialingPlanRequest {
  page: number;
  perPage: number;
}

interface IDialingPlanRecord {
  uri: string;
  id: string;
  name: string;
  isoCode: string;
  callingCode: string;
}

interface IDialingPlanResponse {
  uri: string;
  records: IDialingPlanRecord[];
  paging: IPagingInfo;
  navigation: INavigationInfo;
}

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

interface IPhoneNumberRequest {
  usageType: string;
  page: number;
  perPage: number;
}

interface ICountryInfo {
  uri: string;
  id: string;
  name: string;
}

interface IPhoneNumberRecord {
  id: number;
  phoneNumber: string;
  paymentType: string;
  type: string;
  usageType: string;
  status: string;
  country: ICountryInfo;
  features: string[];
}

interface IPhoneNumberResponse {
  uri: string;
  records: IPhoneNumberRecord[];
  paging: IPagingInfo;
  navigation: INavigationInfo;
}

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
  getAccountDialingPlan,
  getExtensionPhoneNumberList,
};
