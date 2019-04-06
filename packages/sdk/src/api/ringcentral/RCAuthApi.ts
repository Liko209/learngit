/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-28 14:25:08
 * Copyright © RingCentral. All rights reserved.
 */

import {
  NETWORK_METHOD,
  NETWORK_VIA,
  BaseResponse,
  NetworkRequestExecutor,
  SURVIVAL_MODE,
  NETWORK_HANDLE_TYPE,
  RESPONSE_HEADER_KEY,
  HA_PRIORITY,
} from 'foundation';
import Api from '../api';
import { RINGCENTRAL_API } from './constants';
import { ITokenModel } from './types';
import { stringify } from 'qs';

class RCAuthApi extends Api {
  static oauthTokenViaAuthCode(params: object, headers?: object) {
    const model = {
      ...params,
      grant_type: 'authorization_code',
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
    };

    const query = {
      path: RINGCENTRAL_API.API_REFRESH_TOKEN,
      method: NETWORK_METHOD.POST,
      data: model,
      authFree: true,
      via: NETWORK_VIA.HTTP,
    };

    const promise = new Promise((resolve, reject) => {
      const callbackFunc = (response: BaseResponse) => {
        if (response.status >= 200 && response.status < 300) {
          resolve(response.data);
          return;
        }
        if (response.status >= 500) {
          const handler = Api.rcNetworkClient.networkManager.networkRequestHandler(
            NETWORK_HANDLE_TYPE.RINGCENTRAL,
          );
          if (handler) {
            handler.onSurvivalModeDetected(SURVIVAL_MODE.SURVIVAL, 0);
          }
        }
        reject(response.status);
      };

      const request = Api.rcNetworkClient.getRequestByVia(
        query,
        NETWORK_VIA.HTTP,
      );
      request.headers.Authorization = `Basic ${request.handlerType.basic()}`;
      request.callback = callbackFunc;
      request.data = stringify(request.data);
      const client = Api.rcNetworkClient.networkManager.clientManager.getApiClient(
        NETWORK_VIA.HTTP,
      );

      const executor = new NetworkRequestExecutor(request, client);
      executor.execute();
    });
    return promise;
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
        response.headers.hasOwnProperty(RESPONSE_HEADER_KEY.RETRY_AFTER)
      ) {
        retryAfter = response.headers[RESPONSE_HEADER_KEY.RETRY_AFTER];
      }
      callback(false, retryAfter);
    };
    const request = Api.rcNetworkClient.getRequestByVia(query, query.via);
    request.callback = callbackFunc;
    Api.rcNetworkClient.networkManager.addApiRequest(request);
  }
}

export { RCAuthApi };
