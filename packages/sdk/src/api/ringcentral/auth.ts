/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-03-01 15:43:04
 * @Last Modified by: Jeffery Huang
 * @Last Modified time: 2018-09-09 14:07:31
 */
import { IResponse } from '../NetworkClient';
import Api from '../api';
import { RINGCENTRAL_API } from './constants';
import { NETWORK_METHOD, NETWORK_VIA } from 'foundation';
export interface IAuthModel { }

export interface IAuthCodeModel {
  code: string;
}

function oauthTokenViaAuthCode(params: object, headers?: object): Promise<IResponse<IAuthModel>> {
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
  return Api.glip2NetworkClient.http(query);
}

function generateCode(clientId: string, redirectUri: string): Promise<IResponse<IAuthCodeModel>> {
  const model = {
    clientId,
    redirectUri,
  };
  const path = Api.httpConfig.rc.apiPlatformVersion ?
    `/${Api.httpConfig.rc.apiPlatformVersion}${RINGCENTRAL_API.API_GENERATE_CODE}`
    : `${RINGCENTRAL_API.API_GENERATE_CODE}`;
  return Api.glip2NetworkClient.http({
    path,
    method: NETWORK_METHOD.POST,
    via: NETWORK_VIA.HTTP,
    data: model,
  });
}

export {
  oauthTokenViaAuthCode,
  generateCode,
};
