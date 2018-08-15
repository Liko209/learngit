/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-05 17:11:17
 * @Last Modified by: Chris Zhan (chris.zhan@ringcentral.com)
 * @Last Modified time: 2018-08-13 16:47:57
 */
import { PERMISSION } from '../../component/featureFlag/interface';
import { NETWORK_METHOD, NETWORK_VIA } from 'foundation';
import Api from '../api';
import { IResponse } from '../NetworkClient';
import { RINGCENTRAL_API } from './constants';

interface ISERVICE_FEATURES {
  featureName: PERMISSION;
  enabled: boolean;
}

interface IEXTENSION_INFO {
  'uri' : string;
  'id' : number;
  'extensionNumber' : string;
  'serviceFeatures' : ISERVICE_FEATURES[];
}

export function fetchServicePermission(): Promise<IResponse<IEXTENSION_INFO>> {
  const query = {
    path: RINGCENTRAL_API.API_EXTENSION_INFO,
    method: NETWORK_METHOD.GET,
    authFree: false,
    via: NETWORK_VIA.HTTP,
  };
  return Api.rcNetworkClient.http(query);
}
