/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-03-01 15:43:04
 * @Last Modified by: Valor Lin (valor.lin@ringcentral.com)
 * @Last Modified time: 2018-08-06 13:58:32
 */
import { IResponse } from '../NetworkClient';
import Api from '../api';
import { RINGCENTRAL_API } from './constants';
import { NETWORK_METHOD, NETWORK_VIA } from 'foundation';
export interface AuthModel { }

export interface AuthCodeModel {
  code: string;
}

function oauthTokenViaAuthCode(params: object, headers?: object): Promise<IResponse<AuthModel>> {
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

function generateCode(clientId: string, redirectUri: string): Promise<IResponse<AuthCodeModel>> {
  const model = {
    clientId,
    redirectUri,
  };
  return Api.glip2NetworkClient.http({
    path: `/${Api.httpConfig.rc.apiPlatformVersion}${RINGCENTRAL_API.API_GENERATE_CODE}`,
    method: NETWORK_METHOD.POST,
    via: NETWORK_VIA.HTTP,
    data: model,
  });
}

export {
  oauthTokenViaAuthCode,
  generateCode,
};
