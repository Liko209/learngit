import { IMockServer } from './types';
import {
  IRequest,
  INetworkRequestExecutorListener,
  IResponse,
  NETWORK_HANDLE_TYPE,
} from 'foundation/network/network';
import { CommonFileServer } from './CommonFileServer';
import { MockGlipServer } from './glip/MockGlipServer';
import { InstanceManager } from './InstanceManager';

export class ProxyServer implements IMockServer {
  handle = (
    request: IRequest<any>,
    listener: INetworkRequestExecutorListener,
  ) => {
    // const { hostname } = url.parse(request.host);
    if (
      [
        NETWORK_HANDLE_TYPE.GLIP,
        NETWORK_HANDLE_TYPE.DEFAULT,
        NETWORK_HANDLE_TYPE.UPLOAD,
      ].includes(request.handlerType.name)
    ) {
      InstanceManager.get(MockGlipServer).handle(request, listener);
    } else {
      InstanceManager.get(CommonFileServer).handle(request, listener);
    }
  }
}
