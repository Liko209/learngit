import { INetworkRequestExecutorListener } from 'src/network/network';
import { InstanceManager } from '../../../../../../sdk/src/__tests__/mockServer/InstanceManager';
import { ProxyServer } from '../../../../../../sdk/src/__tests__/mockServer/ProxyServer';
import { SocketRequest } from '..';

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
