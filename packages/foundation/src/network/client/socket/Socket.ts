/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:43:39
 * Copyright © RingCentral. All rights reserved.
 */
import BaseClient from '../BaseClient';
import SocketResponse from './SocketResponse';
import { SocketClientGetter } from './SocketIOClient';
import { IRequest, INetworkRequestExecutorListener } from '../..';
import SocketRequest from './SocketRequest';

class Socket extends BaseClient {
  request(request: IRequest, listener: INetworkRequestExecutorListener) {
    super.request(request, listener);
    const socketRequest = request as SocketRequest;
    if (request.params) {
      socketRequest.parameters = request.params;
    }

    const socket = SocketClientGetter.get();
    if (socket) {
      socket.request(socketRequest, (response: SocketResponse) =>
        listener.onSuccess(request.id, response),
      );
    }
  }
}
export default Socket;
