/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-28 14:25:08
 * Copyright © RingCentral. All rights reserved.
 */

import {
  NETWORK_METHOD,
  NETWORK_VIA,
  BaseResponse,
  RESPONSE_HEADER_KEY,
  HA_PRIORITY,
  REQUEST_PRIORITY,
} from 'foundation/network';
import Api from '../api';
import { RINGCENTRAL_API } from './constants';
import { ITokenModel, RCAuthCodeInfo } from './types';
import { ApiConfiguration } from '../config';

class RCAuthApi extends Api {
  static oauthTokenViaAuthCode(params: object, headers?: object) {
    const model = {
      ...params,
      grant_type: 'authorization_code',
      client_id: ApiConfiguration.apiConfig.rc.clientId,
    };

    const query = {
      headers,
      path: RINGCENTRAL_API.API_OAUTH_TOKEN,
      method: NETWORK_METHOD.POST,
      via: NETWORK_VIA.HTTP,
      data: model,
      authFree: true,
    };
    return Api.rcNetworkClient.http<ITokenModel>(query);
  }

  /**
   * @param {string} grant_type
   * @param {string} username
   * @param {string} password
   * return authData for glip login by password
   */
  static loginRCByPassword(data: object) {
    const model = { ...data, grant_type: 'password' };
    const query = {
      path: RINGCENTRAL_API.API_OAUTH_TOKEN,
      method: NETWORK_METHOD.POST,
      data: model,
      authFree: true,
      via: NETWORK_VIA.HTTP,
    };
    return RCAuthApi.rcNetworkClient.http<ITokenModel>(query);
  }

  static refreshToken(data: ITokenModel) {
    const model = {
      refresh_token: data.refresh_token,
      endpoint_id: data.endpoint_id,
      grant_type: 'refresh_token',
      client_id: ApiConfiguration.apiConfig.rc.clientId,
    };

    const query = {
      path: RINGCENTRAL_API.API_REFRESH_TOKEN,
      method: NETWORK_METHOD.POST,
      data: model,
      authFree: true,
      via: NETWORK_VIA.HTTP,
      priority: REQUEST_PRIORITY.IMMEDIATE,
    };

    return RCAuthApi.rcNetworkClient.http<ITokenModel>(query);
  }

  static requestServerStatus(
    callback: (success: boolean, retryAfter: number) => void,
  ) {
    const query = {
      path: RINGCENTRAL_API.API_Status,
      method: NETWORK_METHOD.GET,
      authFree: true,
      via: NETWORK_VIA.HTTP,
      HAPriority: HA_PRIORITY.HIGH,
    };

    const callbackFunc = (response: BaseResponse) => {
      if (response.status >= 200 && response.status < 300) {
        callback(true, 0);
        return;
      }
      let retryAfter = 0;
      if (
        response.headers &&
        Object.prototype.hasOwnProperty.call(
          response.headers,
          RESPONSE_HEADER_KEY.RETRY_AFTER,
        )
      ) {
        retryAfter = response.headers[RESPONSE_HEADER_KEY.RETRY_AFTER];
      }
      callback(false, retryAfter);
    };
    const request = Api.rcNetworkClient.getRequestByVia(query, query.via);
    request.callback = callbackFunc;
    Api.rcNetworkClient.networkManager.addApiRequest(request);
  }

  static generateRCCode(clientId: string, ttl: number) {
    const model = {
      clientId,
      ttl,
    };

    return RCAuthApi.rcNetworkClient.http<RCAuthCodeInfo>({
      path: RINGCENTRAL_API.API_GENERATE_CODE,
      method: NETWORK_METHOD.POST,
      via: NETWORK_VIA.HTTP,
      data: model,
    });
  }
}

export { RCAuthApi };
