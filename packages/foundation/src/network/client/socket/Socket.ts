/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:43:39
 * Copyright © RingCentral. All rights reserved.
 */
import BaseClient from '../BaseClient';
import { SocketResponse } from './SocketResponse';
import { SocketClient } from './SocketIOClient';
import { IRequest, INetworkRequestExecutorListener } from '../../network';
import SocketRequest from './SocketRequest';
import { networkLogger } from '../../../log';
class Socket extends BaseClient {
  request(request: IRequest, listener: INetworkRequestExecutorListener) {
    super.request(request, listener);
    const socketRequest = request as SocketRequest;
    const socket = SocketClient.get();
    if (socket) {
      socket.request(socketRequest).then(
        (response: SocketResponse) => {
          this.tasks.delete(request.id);
          response.request && (response.request.startTime = request.startTime);
          listener.onSuccess(response);
        },
        (response: SocketResponse) => {
          networkLogger.info('Socket request failed', {
            status: response.status,
            statusText: response.statusText,
          });
          this.tasks.delete(request.id);
          response.request && (response.request.startTime = request.startTime);
          listener.onFailure(response);
        },
      );
    }
  }
  isNetworkReachable(): boolean {
    const socket = SocketClient.get && SocketClient.get();
    return socket && socket.isClientAvailable();
  }
}
export default Socket;
