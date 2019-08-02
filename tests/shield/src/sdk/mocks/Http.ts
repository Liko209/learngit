/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:18:21
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IRequest,
  INetworkRequestExecutorListener,
} from 'foundation/network/network';
import { InstanceManager } from 'shield/sdk/server/InstanceManager';
import { ProxyServer } from 'shield/sdk/server/ProxyServer';

export default class Http {
  request = (request: IRequest, listener: INetworkRequestExecutorListener) => {
    InstanceManager.get(ProxyServer).handleRequest(request, listener);
  };

  isNetworkReachable = () => window.navigator.onLine;

  cancelRequest() {}
}
