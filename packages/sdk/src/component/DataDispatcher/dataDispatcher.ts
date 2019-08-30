import { parseSocketData } from '../../utils';
import { EventEmitter2 } from 'eventemitter2';
import { SOCKET } from '../../service/eventKey';
import { mainLogger } from 'foundation/log';

type Handler = (data: any) => any;

class DataDispatcher extends EventEmitter2 {
  register(key: SOCKET, dataHandler: Handler) {
    this.on(key, dataHandler);
  }

  unregister(key: SOCKET, dataHandler: Handler) {
    this.off(key, dataHandler);
  }

  async onDataArrived(channel: string, data: string, partial?: boolean) {
    const entries = parseSocketData(channel, data);
    if (!entries) {
      return;
    }

    return Promise.all(
      Object.keys(entries).map((key: string) => {
        return this.emitAsync(
          this._getEmitEvent('SOCKET', key, partial),
          entries[key],
        );
      }),
    );
  }

  private _getEmitEvent(channel: string, eventKey: string, partial?: boolean) {
    const event = `${channel.toUpperCase()}${
      partial ? '.PARTIAL' : ''
    }.${eventKey.toUpperCase()}`;
    if (event !== 'SOCKET.PRESENCE' && event !== 'SOCKET.TYPING') {
      mainLogger.info(`Data dispatched for event:${event}`);
    }
    return event;
  }
}
const dataDispatcher = new DataDispatcher();
export default dataDispatcher;
