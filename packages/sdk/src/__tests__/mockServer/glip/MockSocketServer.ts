const fixtureSocket = require('can-fixture-socket');

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

  emitPartial(partial: object) {
    this.emit('partial', partial);
  }
}
