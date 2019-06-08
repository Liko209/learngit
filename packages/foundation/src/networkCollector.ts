import { IRequest, IResponse } from './network/network';
import { SocketResponse } from './network/client/socket/SocketResponse';
import _ from 'lodash';

class NetworkCollector {
  collection: {
    request: Partial<IRequest>;
    response: Partial<IResponse>;
  }[] = [];

  add = (request: Partial<IRequest>, response: Partial<IResponse>): void => {
    if (response instanceof SocketResponse) {
      this.collection.push({
        response,
        request: _.omit(request, 'handleType'),
      });
    } else {
      this.collection.push({
        response: _.omit(response, 'request'),
        request: _.omit(request, 'handleType'),
      });
    }
  }

  getAll = () => {
    return this.collection;
  }
}

const networkCollector = new NetworkCollector();
(window as any).networkCollector = networkCollector;

export { networkCollector };
