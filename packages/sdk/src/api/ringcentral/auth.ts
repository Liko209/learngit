/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-03-01 15:43:04
 * @Last Modified by: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Last Modified time: 2018-07-23 14:36:08
 */
import { IResponse } from '../NetworkClient';
import Api from '../api';
import { RINGCENTRAL_API } from './constants';
import { NETWORK_METHOD, NETWORK_VIA } from 'foundation';
export interface AuthModel {}

export interface AuthCodeModel {
  code: string;
}

export function oauthTokenViaAuthCode(params: object, headers?: object): Promise<IResponse<AuthModel>> {
  const model = {
    ...params,
    grant_type: 'authorization_code'
  };

  const query = {
    path: RINGCENTRAL_API.API_OAUTH_TOKEN,
    method: NETWORK_METHOD.POST,
    via: NETWORK_VIA.HTTP,
    data: model,
    authFree: true,
    headers
  };
  return Api.glip2NetworkClient.http(query);
}

export function generateCode(clientId: string, redirectUri: string): Promise<IResponse<AuthCodeModel>> {
  const model = {
    clientId,
    redirectUri
  };
  return Api.glip2NetworkClient.http({
    path: `/${Api.httpConfig.rc.apiPlatformVersion}${RINGCENTRAL_API.API_GENERATE_CODE}`,
    method: NETWORK_METHOD.POST,
    via: NETWORK_VIA.HTTP,
    data: model
  });
}
