import { parseSocketMessage } from '../../utils';
import { EventEmitter2 } from 'eventemitter2';
import { SOCKET } from '../../service';

type Handler = (data: any) => any;
class DataDispatcher extends EventEmitter2 {
  register(key: SOCKET, dataHandler: Handler) {
    console.info('Datadispatcher registing', key);
    this.on(key, dataHandler);
  }

  unregister(key: SOCKET, dataHandler: Handler) {
    console.info('Datadispatcher unregistering', key);
    this.off(key, dataHandler);
  }

  async onDataArrived(data: string) {
    let entries = parseSocketMessage(data);
    console.info('Datadispatcher handling', Object.keys(entries));
    return Promise.all(
      Object.keys(entries).map((key: string) => this.emitAsync(`SOCKET.${key.toUpperCase()}`, entries[key]))
    );
  }
}
export default new DataDispatcher();
