const fixtureSocket = require('can-fixture-socket');
// const io = require('socket.io-client');
import io from 'socket.io-client';
import { createDebug } from 'sdk/__tests__/utils';
const debug = createDebug('MockSocketServer', true);

export class MockSocketServer {
  socket: any;

  constructor() {
    this.socket = new fixtureSocket.Server(io);
  }

  on(channel: string, listener: (message: any) => void) {
    this.socket.on(channel, listener);
  }

  emit(channel: string, message: any) {
    this.socket.emit(channel, message);
  }

  emitEntityCreate(entity: object) {
    setTimeout(() => {
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
    });
  }

  emitMessage(entity: object) {
    setTimeout(() => {
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
    });
  }

  emitPartial(partial: object, partialBody?: object) {
    setTimeout(() => {
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
    });
  }
}
