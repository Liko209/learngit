/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-05 17:11:17
 * @Last Modified by: Jeffery Huang
 * @Last Modified time: 2018-09-09 14:08:23
 */
import { PERMISSION } from '../../component/featureFlag/interface';
import { NETWORK_METHOD, NETWORK_VIA } from 'foundation';
import Api from '../api';
import { IResponse } from '../NetworkClient';
import { RINGCENTRAL_API } from './constants';

interface IServiceFeatures {
  featureName: PERMISSION;
  enabled: boolean;
}

interface IExtensionInfo {
  'uri' : string;
  'id' : number;
  'extensionNumber' : string;
  'serviceFeatures' : IServiceFeatures[];
}

export function fetchServicePermission(): Promise<IResponse<IExtensionInfo>> {
  const query = {
    path: RINGCENTRAL_API.API_EXTENSION_INFO,
    method: NETWORK_METHOD.GET,
    authFree: false,
    via: NETWORK_VIA.HTTP,
  };
  return Api.rcNetworkClient.http(query);
}
