const fixtureSocket = require('can-fixture-socket');
// const io = require('socket.io-client');
import io from 'socket.io-client';

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

  emitPartial(partial: object, hint?: object) {
    this.socket.emit(
      'partial',
      JSON.stringify({
        body: {
          partial: true,
          timestamp: Date.now(),
          objects: [[{ ...partial }]],
          ...{ hint },
        },
      }),
    );
    setTimeout(() => {});
  }
}
