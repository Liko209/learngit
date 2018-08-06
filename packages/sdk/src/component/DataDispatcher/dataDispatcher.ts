import { parseSocketMessage } from '../../utils';
import { EventEmitter2 } from 'eventemitter2';
import { SOCKET } from '../../service';

type Handler = (data: any) => any;
class DataDispatcher extends EventEmitter2 {
  register(key: SOCKET, dataHandler: Handler) {
    console.info('DataDispatcher registing', key);
    this.on(key, dataHandler);
  }

  unregister(key: SOCKET, dataHandler: Handler) {
    console.info('DataDispatcher unregistering', key);
    this.off(key, dataHandler);
  }

  async onDataArrived(data: string) {
    const messages = parseSocketMessage(data);
    console.info('DataDispatcher handling', Object.keys(messages));

    return Promise.all(
      Object
        .entries(messages)
        .map(this._emitMessageAsync.bind(this)),
    );
  }

  private async _emitMessageAsync([key, message]: [string, any]) {
    return this.emitAsync(`SOCKET.${key.toUpperCase()}`, message);
  }
}
export default new DataDispatcher();
