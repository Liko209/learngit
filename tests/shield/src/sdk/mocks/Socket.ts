/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:18:15
 * Copyright © RingCentral. All rights reserved.
 */
import { INetworkRequestExecutorListener } from 'foundation/network/network';
import { InstanceManager } from '../mocks/server/InstanceManager';
import { ProxyServer } from '../mocks/server/ProxyServer';
import { SocketRequest } from 'foundation/network/client/socket';

export default class Socket {
  request = (
    request: SocketRequest,
    listener: INetworkRequestExecutorListener,
  ) => {
    request.params = request.parameters;
    InstanceManager.get(ProxyServer).handle(request, listener);
  }

  isNetworkReachable = () => window.navigator.onLine;

  cancelRequest() {}
}
