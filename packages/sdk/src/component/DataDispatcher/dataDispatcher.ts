import { parseSocketMessage } from '../../utils';
import { EventEmitter2 } from 'eventemitter2';
import { SOCKET } from '../../service';

type Handler = (data: any) => any;
class DataDispatcher extends EventEmitter2 {
  register(key: SOCKET, dataHandler: Handler) {
    this.on(key, dataHandler);
  }

  unregister(key: SOCKET, dataHandler: Handler) {
    this.off(key, dataHandler);
  }

  async onDataArrived(data: string) {
    const entries = parseSocketMessage(data);
    return Promise.all(
      Object.keys(entries).map((key: string) =>
        this.emitAsync(`SOCKET.${key.toUpperCase()}`, entries[key]),
      ),
    );
  }
}
export default new DataDispatcher();
