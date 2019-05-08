/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 16:27:42
 * Copyright © RingCentral. All rights reserved.
 */

import Api from '../api';
import { RINGCENTRAL_API, HTTP_HEADER_KEY, CONTENT_TYPE } from './constants';
import { NETWORK_METHOD, NETWORK_VIA, HA_PRIORITY } from 'foundation';
import { RCClientInfo } from './types/RCClientInfo';
import { RCAccountInfo } from './types/RCAccountInfo';
import { RCExtensionInfo } from './types/RCExtensionInfo';
import { RCRolePermissions } from './types/RCRolePermissions';
import { AccountServiceInfo } from './types/AccountServiceInfo';
import {
  RCAPIVersion,
  ISpecialServiceRequest,
  ISpecialServiceNumber,
  IDialingPlanRequest,
  DialingPlan,
  IPhoneNumberRequest,
  IExtensionPhoneNumberList,
} from './types/common';

class RCInfoApi extends Api {
  static requestRCAPIVersion() {
    const query = {
      path: RINGCENTRAL_API.API_VERSION,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return RCInfoApi.rcNetworkClient.http<RCAPIVersion>(query);
  }

  static requestRCClientInfo() {
    const query = {
      path: RINGCENTRAL_API.API_CLIENT_INFO,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return RCInfoApi.rcNetworkClient.http<RCClientInfo>(query);
  }

  static requestRCAccountInfo() {
    const query = {
      path: RINGCENTRAL_API.API_ACCOUNT_INFO,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return RCInfoApi.rcNetworkClient.http<RCAccountInfo>(query);
  }

  static requestRCExtensionInfo() {
    const query = {
      path: RINGCENTRAL_API.API_EXTENSION_INFO,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return RCInfoApi.rcNetworkClient.http<RCExtensionInfo>(query);
  }

  static requestRCRolePermissions() {
    const query = {
      path: RINGCENTRAL_API.API_ROLE_PERMISSIONS,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return RCInfoApi.rcNetworkClient.http<RCRolePermissions>(query);
  }

  static getSpecialNumbers(request?: ISpecialServiceRequest) {
    const query = {
      path: RINGCENTRAL_API.API_SPECIAL_SERVICE_NUMBER,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      params: request,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return RCInfoApi.rcNetworkClient.http<ISpecialServiceNumber>(query);
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
    return RCInfoApi.rcNetworkClient.http<string>(query);
  }

  static getDialingPlan(request?: IDialingPlanRequest) {
    const query = {
      path: RINGCENTRAL_API.API_DIALING_PLAN,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      params: request,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return RCInfoApi.rcNetworkClient.http<DialingPlan>(query);
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
    return RCInfoApi.rcNetworkClient.http<IExtensionPhoneNumberList>(query);
  }

  static getAccountServiceInfo() {
    const query = {
      path: RINGCENTRAL_API.API_SERVICE_INFO,
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
    };
    return RCInfoApi.rcNetworkClient.http<AccountServiceInfo>(query);
  }
}

export { RCInfoApi };
