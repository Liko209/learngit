/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-14 11:03:43
 * Copyright © RingCentral. All rights reserved.
 */
import { RINGCENTRAL_API, HTTP_HEADER_KEY, CONTENT_TYPE } from './constants';
import { NETWORK_METHOD, NETWORK_VIA, HA_PRIORITY } from 'foundation';
import Api from '../api';
import {
  ISpecialServiceRequest,
  ISpecialServiceNumberResponse,
  IDialingPlanRequest,
  IDialingPlanResponse,
  IPhoneNumberRequest,
  IPhoneNumberResponse,
} from './types/common';

class TelephonyApi extends Api {
  static getSpecialNumbers(request?: ISpecialServiceRequest) {
    const query = {
      path: RINGCENTRAL_API.API_SPECIAL_SERVICE_NUMBER,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      params: request,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return Api.rcNetworkClient.http<ISpecialServiceNumberResponse>(query);
  }

  static getPhoneParserData(localDataVersion: string) {
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
      HAPriority: HA_PRIORITY.HIGH,
    };
    return Api.rcNetworkClient.http<string>(query);
  }

  static getAccountDialingPlan(request?: IDialingPlanRequest) {
    const query = {
      path: RINGCENTRAL_API.API_DIALING_PLAN,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      params: request,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return Api.rcNetworkClient.http<IDialingPlanResponse>(query);
  }

  static getExtensionPhoneNumberList(request?: IPhoneNumberRequest) {
    const query = {
      path: RINGCENTRAL_API.API_EXTENSION_PHONE_NUMBER,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      params: request,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return Api.rcNetworkClient.http<IPhoneNumberResponse>(query);
  }
}

export { TelephonyApi };
