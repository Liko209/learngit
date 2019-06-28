/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 16:27:42
 * Copyright © RingCentral. All rights reserved.
 */

import Api from '../api';
import { RINGCENTRAL_API } from './constants';
import {
  NETWORK_METHOD,
  NETWORK_VIA,
  HA_PRIORITY,
  REQUEST_HEADER_KEYS,
  CONTENT_TYPES,
} from 'foundation';
import { RCClientInfo } from './types/RCClientInfo';
import { RCAccountInfo } from './types/RCAccountInfo';
import { RCExtensionInfo } from './types/RCExtensionInfo';
import { RCRolePermissions } from './types/RCRolePermissions';
import { AccountServiceInfo } from './types/AccountServiceInfo';
import { RCExtensionForwardingNumberRCList } from './types/RCForwardingNumbers';
import {
  RCAPIVersion,
  ISpecialServiceRequest,
  ISpecialServiceNumber,
  IDialingPlanRequest,
  DialingPlan,
  IPhoneNumberRequest,
  IExtensionPhoneNumberList,
  IForwardingNumberRequest,
  IExtensionCallerId,
  IExtensionCallerIdRequest,
} from './types/common';

class RCInfoApi extends Api {
  private static _requestParameters(options: any) {
    return {
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
      ...options,
    };
  }
  static requestRCAPIVersion() {
    const query = this._requestParameters({
      path: RINGCENTRAL_API.API_VERSION,
    });

    return RCInfoApi.rcNetworkClient.http<RCAPIVersion>(query);
  }

  static requestRCClientInfo() {
    const query = this._requestParameters({
      path: RINGCENTRAL_API.API_CLIENT_INFO,
    });
    return RCInfoApi.rcNetworkClient.http<RCClientInfo>(query);
  }

  static requestRCAccountInfo() {
    const query = this._requestParameters({
      path: RINGCENTRAL_API.API_ACCOUNT_INFO,
    });
    return RCInfoApi.rcNetworkClient.http<RCAccountInfo>(query);
  }

  static requestRCExtensionInfo() {
    const query = this._requestParameters({
      path: RINGCENTRAL_API.API_EXTENSION_INFO,
    });
    return RCInfoApi.rcNetworkClient.http<RCExtensionInfo>(query);
  }

  static requestRCRolePermissions() {
    const query = this._requestParameters({
      path: RINGCENTRAL_API.API_ROLE_PERMISSIONS,
    });
    return RCInfoApi.rcNetworkClient.http<RCRolePermissions>(query);
  }

  static getSpecialNumbers(request?: ISpecialServiceRequest) {
    const query = this._requestParameters({
      path: RINGCENTRAL_API.API_SPECIAL_SERVICE_NUMBER,
      params: request,
    });
    return RCInfoApi.rcNetworkClient.http<ISpecialServiceNumber>(query);
  }

  static getPhoneParserData(localDataVersion: string) {
    const extraHeaders = {};
    const localDataVersionWithQuote = `\"${localDataVersion}\"`;
    extraHeaders[REQUEST_HEADER_KEYS.ACCEPT] = CONTENT_TYPES.XML;
    extraHeaders[REQUEST_HEADER_KEYS.IF_NONE_MATCH] = localDataVersionWithQuote;
    const query = this._requestParameters({
      path: RINGCENTRAL_API.API_PHONE_PARSER_DATA,
      headers: extraHeaders,
    });
    return RCInfoApi.rcNetworkClient.http<string>(query);
  }

  static getDialingPlan(request?: IDialingPlanRequest) {
    const query = this._requestParameters({
      path: RINGCENTRAL_API.API_DIALING_PLAN,
      params: request,
    });
    return RCInfoApi.rcNetworkClient.http<DialingPlan>(query);
  }

  static getExtensionPhoneNumberList(request?: IPhoneNumberRequest) {
    const query = this._requestParameters({
      path: RINGCENTRAL_API.API_EXTENSION_PHONE_NUMBER,
      params: request,
    });
    return RCInfoApi.rcNetworkClient.http<IExtensionPhoneNumberList>(query);
  }
  static getExtensionCallerId() {
    const query = this._requestParameters({
      path: RINGCENTRAL_API.API_EXTENSION_CALLER_ID,
    });
    return RCInfoApi.rcNetworkClient.http<IExtensionCallerId>(query);
  }
  static setExtensionCallerId(request: IExtensionCallerIdRequest) {
    const query = this._requestParameters({
      path: RINGCENTRAL_API.API_EXTENSION_CALLER_ID,
      method: NETWORK_METHOD.PUT,
      data: request,
    });
    return RCInfoApi.rcNetworkClient.http<IExtensionCallerId>(query);
  }

  static getAccountServiceInfo() {
    const query = this._requestParameters({
      path: RINGCENTRAL_API.API_SERVICE_INFO,
    });
    return RCInfoApi.rcNetworkClient.http<AccountServiceInfo>(query);
  }

  static getForwardingNumbers(request?: IForwardingNumberRequest) {
    const query = this._requestParameters({
      path: RINGCENTRAL_API.API_FORWARDING_NUMBERS,
      params: request,
    });
    return RCInfoApi.rcNetworkClient.http<RCExtensionForwardingNumberRCList>(
      query,
    );
  }
}

export { RCInfoApi };
