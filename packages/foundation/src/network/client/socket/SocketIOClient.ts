/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-02-08 14:50:12
 * Copyright © RingCentral. All rights reserved.
 */
import SocketRequest from './SocketRequest';
import io from './socket.io';
import SocketRequestHelper from './SocketRequestHelper';
import { SocketResponse } from './SocketResponse';
interface ISocketRequestDelegate {
  request: (request: SocketRequest) => Promise<SocketResponse>;
  isClientAvailable: () => boolean;
}
class SocketClient implements ISocketRequestDelegate {
  static get: () => ISocketRequestDelegate;
  socket: SocketIOClient.Socket;
  socketRequestHelper: SocketRequestHelper;

  constructor(socketServer: string, token: string) {
    this.socketRequestHelper = new SocketRequestHelper();
    this.socket = io(`https://${socketServer}`, {
      transports: ['polling', 'websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 25000,
      forceNew: true,
      query: { tk: token },
    });

    this.socket.on('response', (response: any) => {
      this.socketRequestHelper.newResponse(response);
    });

    SocketClient.get = () => {
      return this as ISocketRequestDelegate;
    };
  }

  request(request: SocketRequest) {
    const socketRequestPromise = this.socketRequestHelper.newRequest(request);
    this.socket.emit('request', request);
    return socketRequestPromise;
  }

  isClientAvailable() {
    return this.socket && this.socket.connected;
  }
}

export { SocketClient };
