import { parseSocketMessage } from '../../utils';
import { EventEmitter2 } from 'eventemitter2';
import { SOCKET } from '../../service';
import { mainLogger } from 'foundation';
type Handler = (data: any) => any;
class DataDispatcher extends EventEmitter2 {
  register(key: SOCKET, dataHandler: Handler) {
    this.on(key, dataHandler);
  }

  unregister(key: SOCKET, dataHandler: Handler) {
    this.off(key, dataHandler);
  }

  onPresenceArrived(data: any) {
    this.emitAsync(this._getEmitEvent('SOCKET', 'presence', false), data);
  }

  async onDataArrived(data: string, partial?: boolean) {
    const entries = parseSocketMessage(data);
    if (!entries) {
      return;
    }
    return Promise.all(
      Object.keys(entries).map((key: string) =>
        this.emitAsync(this._getEmitEvent('SOCKET', key, partial), entries[key]),
      ),
    );
  }

  private _getEmitEvent(channel: string, eventKey: string, partial?: boolean) {
    const event = `${channel.toUpperCase()}${
      partial ? '.PARTIAL' : ''
    }.${eventKey.toUpperCase()}`;
    if (event !== 'SOCKET.PRESENCE') {
      mainLogger.info(`Data dispatched for event:${event}`);
    }
    return event;
  }
}
export default new DataDispatcher();
