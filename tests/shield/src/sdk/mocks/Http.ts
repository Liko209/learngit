import {
  IRequest,
  INetworkRequestExecutorListener,
} from 'foundation/network/network';
import { InstanceManager } from '../mocks/server/InstanceManager';
import { ProxyServer } from '../mocks/server/ProxyServer';

export default class Http {
  request = (request: IRequest, listener: INetworkRequestExecutorListener) => {
    InstanceManager.get(ProxyServer).handle(request, listener);
  }

  isNetworkReachable = () => window.navigator.onLine;

  cancelRequest() {}
}
