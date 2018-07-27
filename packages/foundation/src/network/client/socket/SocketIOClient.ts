/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-02-08 14:50:12
 * Copyright © RingCentral. All rights reserved.
 */
import { SocketResponseBuilder } from './SocketResponseBuilder';
import SocketRequest from './SocketRequest';
import io from './socket.io';
class SocketClientGetter {
  static get: () => any;
}

class SocketClient {
  socket: any;

  constructor(socketServer: string, token: string) {
    this.socket = io(`https://${socketServer}`, {
      transports: ['polling', 'websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 25000,
      forceNew: true,
      query: { tk: token },
    });

    this.socket.request = (request: SocketRequest, listener: any) => {
      // const socketRequest = new SocketRequestBuilder(request).build();
      request.setCallback(listener);
      this.socket.emit('request', request);
    };

    this.socket.on('response', (response: any) => {
      const socketResponse = (new SocketResponseBuilder() as SocketResponseBuilder)
        .options(response)
        .build();
      socketResponse.response();
    });

    this.socket.checkConnected = () => {
      this.socket.emit('ping');
    };

    this.socket.send = () => { };

    this.socket.reset = () => { };

    this.socket.cancelRequest = () => { };

    this.socket.stopCheckConnected = () => { };

    SocketClientGetter.get = () => this.socket;
  }
}

export { SocketClient, SocketClientGetter };
