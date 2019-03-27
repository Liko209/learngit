/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-03-01 15:43:04
 * @Last Modified by: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Last Modified time: 2019-03-19 21:27:47
 */

import Api from '../api';
import { RINGCENTRAL_API } from './constants';
import { NETWORK_METHOD, NETWORK_VIA, HA_PRIORITY } from 'foundation';
import { ITokenModel } from '../ringcentral/login';

export interface IAuthCodeModel {
  code: string;
}

function oauthTokenViaAuthCode(params: object, headers?: object) {
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

function generateCode(clientId: string, redirectUri: string) {
  const model = {
    clientId,
    redirectUri,
  };
  const path = Api.httpConfig.rc.apiPlatformVersion
    ? `/${Api.httpConfig.rc.apiPlatformVersion}${
        RINGCENTRAL_API.API_GENERATE_CODE
      }`
    : `${RINGCENTRAL_API.API_GENERATE_CODE}`;
  return Api.rcNetworkClient.http<IAuthCodeModel>({
    path,
    method: NETWORK_METHOD.POST,
    via: NETWORK_VIA.HTTP,
    data: model,
    HAPriority: HA_PRIORITY.HIGH,
  });
}

export { oauthTokenViaAuthCode, generateCode };
