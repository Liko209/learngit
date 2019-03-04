/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-05 17:11:17
 * Copyright © RingCentral. All rights reserved.
 */
import {
  Token,
  NETWORK_METHOD,
  NETWORK_VIA,
  BaseResponse,
  NetworkRequestExecutor,
} from 'foundation';
import Api from '../api';
import { RINGCENTRAL_API } from './constants';
import { responseParser } from '../parser';
import { stringify } from 'qs';

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

/**
 * @param {string} grant_type
 * @param {string} username
 * @param {string} password
 * return authData for glip login by password
 */
function loginRCByPassword(data: object) {
  const model = { ...data, grant_type: 'password' };
  const query = {
    path: RINGCENTRAL_API.API_OAUTH_TOKEN,
    method: NETWORK_METHOD.POST,
    data: model,
    authFree: true,
    via: NETWORK_VIA.HTTP,
  };
  return Api.rcNetworkClient.http<ITokenModel>(query);
}

/**
 * @param {string} grant_type
 * @param {string} username
 * @param {string} password
 * rc login for glip 2.0 api by password
 */
function loginGlip2ByPassword(data: object) {
  const model = { ...data, grant_type: 'password' };
  const query = {
    path: RINGCENTRAL_API.API_OAUTH_TOKEN,
    method: NETWORK_METHOD.POST,
    data: model,
    authFree: true,
    via: NETWORK_VIA.HTTP,
  };

  return Api.glip2NetworkClient.http<ITokenModel>(query);
}

function refreshToken(data: ITokenModel) {
  const model = {
    grant_type: 'refresh_token',
    refresh_token: data.refresh_token,
    client_id: Api.httpConfig.rc.clientId,
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
      reject(responseParser.parse(response));
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

    Api.rcNetworkClient.networkManager.handlers;
    const executor = new NetworkRequestExecutor(request, client);
    executor.execute();
  });

  return promise;
}

export { ITokenModel, loginRCByPassword, loginGlip2ByPassword, refreshToken };
