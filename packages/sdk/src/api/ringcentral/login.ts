/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-05 17:11:17
 * @Last Modified by: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Last Modified time: 2018-07-23 14:40:52
 */
import { Token, NETWORK_METHOD, NETWORK_VIA } from 'foundation';

import Api from '../api';
import { IResponse } from '../NetworkClient';
import { RINGCENTRAL_API } from './constants';

export interface TokenModel extends Token {
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
export function loginRCByPassword(data: object): Promise<IResponse<TokenModel>> {
  const model = { ...data, grant_type: 'password' };
  const query = {
    path: RINGCENTRAL_API.API_OAUTH_TOKEN,
    method: NETWORK_METHOD.POST,
    data: model,
    authFree: true,
    via: NETWORK_VIA.HTTP
  };
  return Api.rcNetworkClient.http(query);
}

/**
 * @param {string} grant_type
 * @param {string} username
 * @param {string} password
 * rc login for glip 2.0 api by password
 */
export function loginGlip2ByPassword(data: object): Promise<IResponse<TokenModel>> {
  const model = { ...data, grant_type: 'password' };
  const query = {
    path: RINGCENTRAL_API.API_OAUTH_TOKEN,
    method: NETWORK_METHOD.POST,
    data: model,
    authFree: true,
    via: NETWORK_VIA.HTTP
  };

  return Api.glip2NetworkClient.http(query);
}

/**
 * @param {string} refresh_token
 * @param {string} grant_type
 */
export function refreshToken(data: object): Promise<IResponse<TokenModel>> {
  const model = { ...data, grant_type: 'refresh_token' };
  const query = {
    path: RINGCENTRAL_API.API_REFRESH_TOKEN,
    method: NETWORK_METHOD.POST,
    data: model,
    authFree: true,
    via: NETWORK_VIA.HTTP
  };

  return Api.rcNetworkClient.http(query);
}
