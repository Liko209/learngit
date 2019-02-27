/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-19 10:29:37
 * Copyright © RingCentral. All rights reserved.
 */
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

export {
  ISpecialServiceRequest,
  ISpecialServiceNumberResponse,
  IDialingPlanRequest,
  IDialingPlanResponse,
  IPhoneNumberRequest,
  IPhoneNumberResponse,
};
