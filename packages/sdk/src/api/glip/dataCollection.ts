/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-26 13:35:53
 * Copyright © RingCentral. All rights reserved.
 */
import { NETWORK_VIA } from 'foundation/network';

import Api from '../api';

function traceData(model: object) {
  if (Api.httpConfig.data_collection) {
    return Api.glipNetworkClient.post<any>({
      authFree: true,
      host: Api.httpConfig.data_collection,
      path: '',
      via: NETWORK_VIA.HTTP,
      data: model,
    });
  }
  return null;
}

export { traceData };
