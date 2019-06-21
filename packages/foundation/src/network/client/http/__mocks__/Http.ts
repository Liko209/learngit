import { IRequest, INetworkRequestExecutorListener } from 'src/network/network';
import { InstanceManager } from '../../../../../../sdk/src/__tests__/mockServer/InstanceManager';
import { ProxyServer } from '../../../../../../sdk/src/__tests__/mockServer/ProxyServer';

export default class Http {
  request = (request: IRequest, listener: INetworkRequestExecutorListener) => {
    InstanceManager.get(ProxyServer).handle(request, listener);
  }

  isNetworkReachable = () => window.navigator.onLine;

  cancelRequest() {}
}
