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
  REQUEST_PRIORITY,
} from 'foundation/network';
import {
  RCClientInfo,
  RCAccountInfo,
  RCExtensionInfo,
  RCRolePermissions,
  AccountServiceInfo,
  RCExtensionForwardingNumberRCList,
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
  GetBlockNumberListParams,
  BlockNumberListResponse,
  BlockNumberItem,
  AddBlockNumberParams,
  IDeviceRequest,
  IAssignLineRequest,
  IUpdateLineRequest,
  IStateRequest,
  CountryState,
  CountryList,
  ICountryRequest,
} from './types';

class RCInfoApi extends Api {
  private static _getInfoRequestParams(options: any) {
    return {
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
      ...options,
    };
  }
  static requestRCAPIVersion() {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_VERSION,
    });

    return RCInfoApi.rcNetworkClient.http<RCAPIVersion>(query);
  }

  static requestRCClientInfo() {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_CLIENT_INFO,
    });
    return RCInfoApi.rcNetworkClient.http<RCClientInfo>(query);
  }

  static requestRCAccountInfo() {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_ACCOUNT_INFO,
    });
    return RCInfoApi.rcNetworkClient.http<RCAccountInfo>(query);
  }

  static requestRCExtensionInfo() {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_EXTENSION_INFO,
    });
    return RCInfoApi.rcNetworkClient.http<RCExtensionInfo>(query);
  }

  static requestRCRolePermissions() {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_ROLE_PERMISSIONS,
    });
    return RCInfoApi.rcNetworkClient.http<RCRolePermissions>(query);
  }

  static getSpecialNumbers(request?: ISpecialServiceRequest) {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_SPECIAL_SERVICE_NUMBER,
      params: request,
    });
    return RCInfoApi.rcNetworkClient.http<ISpecialServiceNumber>(query);
  }

  static getPhoneParserData(localDataVersion: string) {
    const extraHeaders = {};

    const localDataVersionWithQuote = `"${localDataVersion}"`;
    extraHeaders[REQUEST_HEADER_KEYS.ACCEPT] = CONTENT_TYPES.XML;
    extraHeaders[REQUEST_HEADER_KEYS.IF_NONE_MATCH] = localDataVersionWithQuote;
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_PHONE_PARSER_DATA,
      headers: extraHeaders,
    });
    return RCInfoApi.rcNetworkClient.http<string>(query);
  }

  static getDialingPlan(request?: IDialingPlanRequest) {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_DIALING_PLAN,
      params: request,
    });
    return RCInfoApi.rcNetworkClient.http<DialingPlan>(query);
  }

  static getCountryState(request?: IStateRequest) {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_STATE_INFO,
      params: request,
    });
    return RCInfoApi.rcNetworkClient.http<CountryState>(query);
  }

  static getExtensionPhoneNumberList(request?: IPhoneNumberRequest) {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_EXTENSION_PHONE_NUMBER,
      params: request,
    });
    return RCInfoApi.rcNetworkClient.http<IExtensionPhoneNumberList>(query);
  }
  static getExtensionCallerId() {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_EXTENSION_CALLER_ID,
    });
    return RCInfoApi.rcNetworkClient.http<IExtensionCallerId>(query);
  }
  static setExtensionCallerId(request: IExtensionCallerIdRequest) {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_EXTENSION_CALLER_ID,
      method: NETWORK_METHOD.PUT,
      data: request,
    });
    return RCInfoApi.rcNetworkClient.http<IExtensionCallerId>(query);
  }

  static getAccountServiceInfo() {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_SERVICE_INFO,
    });
    return RCInfoApi.rcNetworkClient.http<AccountServiceInfo>(query);
  }

  static getCountryInfo(request: ICountryRequest) {
    const query = this._getInfoRequestParams({
      path: RINGCENTRAL_API.API_COUNTRY_INFO,
      params: request,
    });
    return RCInfoApi.rcNetworkClient.http<CountryList>(query);
  }

  static getDeviceInfo(request: IDeviceRequest) {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_DEVICE_INFO,
      params: request,
      priority: REQUEST_PRIORITY.HIGH,
    });
    return RCInfoApi.rcNetworkClient.http<DialingPlan>(query);
  }

  static getForwardingNumbers(request?: IForwardingNumberRequest) {
    const query = RCInfoApi._getInfoRequestParams({
      path: RINGCENTRAL_API.API_FORWARDING_NUMBERS,
      params: request,
    });
    return RCInfoApi.rcNetworkClient.http<RCExtensionForwardingNumberRCList>(
      query,
    );
  }

  static getBlockNumberList(params: GetBlockNumberListParams) {
    const query = RCInfoApi._getInfoRequestParams({
      params,
      path: RINGCENTRAL_API.BLOCKED_NUMBER,
    });
    return RCInfoApi.rcNetworkClient.http<BlockNumberListResponse>(query);
  }

  static deleteBlockNumbers(ids: string[]) {
    const query = {
      method: NETWORK_METHOD.DELETE,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
      path: `${RINGCENTRAL_API.BLOCKED_NUMBER}/${ids.join(',')}`,
    };
    return RCInfoApi.rcNetworkClient.http(query);
  }

  static addBlockNumbers(data: AddBlockNumberParams) {
    const query = {
      data,
      method: NETWORK_METHOD.POST,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
      path: RINGCENTRAL_API.BLOCKED_NUMBER,
    };
    return RCInfoApi.rcNetworkClient.http<BlockNumberItem>(query);
  }

  static getRCPresence() {
    const query = {
      method: NETWORK_METHOD.GET,
      authFree: false,
      via: NETWORK_VIA.HTTP,
      path: RINGCENTRAL_API.API_TELEPHONY_PRESENCE,
    };
    return RCInfoApi.rcNetworkClient.http(query);
  }

  static assignLine(deviceId: string, data: IAssignLineRequest) {
    const query = {
      data,
      method: NETWORK_METHOD.POST,
      path: `${RINGCENTRAL_API.API_UPDATE_DEVICE}/${deviceId}/assign-line`,
    };
    return RCInfoApi.rcNetworkClient.http(query);
  }

  static updateLine(deviceId: string, data: IUpdateLineRequest) {
    const query = {
      data,
      method: NETWORK_METHOD.PUT,
      path: `${RINGCENTRAL_API.API_UPDATE_DEVICE}/${deviceId}`,
    };
    return RCInfoApi.rcNetworkClient.http(query);
  }
}

export { RCInfoApi };
