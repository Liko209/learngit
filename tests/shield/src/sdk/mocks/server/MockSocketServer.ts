/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:19:22
 * Copyright © RingCentral. All rights reserved.
 */
import { Server } from 'mock-socket';
import { createDebug } from 'sdk/__tests__/utils';
import { wait } from 'shield/utils';

const debug = createDebug('MockSocketServer');

export class MockSocketServer {
  socket: any;

  constructor(url: string) {
    this.socket = new Server(url);
    this.on('connection', () => {
      debug('connection', url);
    });
    this.on('ping', () => {
      debug('ping', url);
      this.socket.send('pong');
    });
  }

  on(channel: string, listener: (message: any) => void) {
    this.socket.on(channel, listener);
  }

  emit(channel: string, message: any) {
    this.socket.emit(channel, message);
  }

  async emitEntityCreate(entity: object) {
    await wait();
    debug('-> emitEntityCreate');
    this.socket.emit(
      'message',
      JSON.stringify({
        body: {
          timestamp: Date.now(),
          objects: [[{ ...entity }]],
        },
      }),
    );
  }

  async emitMessage(entity: object) {
    await wait();
    debug('-> emitMessage');
    this.socket.emit(
      'message',
      JSON.stringify({
        body: {
          timestamp: Date.now(),
          objects: [[{ ...entity }]],
        },
      }),
    );
  }

  async emitPartial(partial: object, partialBody?: object) {
    await wait();
    debug('-> emitPartial');
    this.socket.emit(
      'partial',
      JSON.stringify({
        body: {
          partial: true,
          timestamp: Date.now(),
          objects: [[{ ...partial }]],
          ...partialBody,
        },
      }),
    );
  }
}
