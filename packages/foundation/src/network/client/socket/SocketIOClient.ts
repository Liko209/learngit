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
  send: (type: string, options: any) => void;
}
class SocketClient implements ISocketRequestDelegate {
  static get: () => ISocketRequestDelegate;
  socket: SocketIOClient.Socket;
  socketRequestHelper: SocketRequestHelper;

  constructor(socketServer: string, token: string) {
    this.socketRequestHelper = new SocketRequestHelper();
    this.socket = io(`https://${socketServer}`, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: false,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 25000,
      forceNew: true,
      query: { tk: token },
    });
    this.socket.on('response', (response: any) => {
      this.socketRequestHelper.newResponse(response);
    });
    this.socket.on('disconnect', () => {
      this.socketRequestHelper.onSocketDisconnect();
    });
    SocketClient.get = () => this as ISocketRequestDelegate;
  }

  request(request: SocketRequest) {
    const socketRequestPromise = this.socketRequestHelper.newRequest(request);
    this.socket.emit('request', request);
    return socketRequestPromise;
  }

  send(type: string, options: any) {
    this.socket.emit(type, options);
  }

  isClientAvailable() {
    return this.socket && this.socket.connected;
  }
}

export { SocketClient };
