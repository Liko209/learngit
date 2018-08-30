import { IFlag, Handler, INotifier } from './interface';
import { EventEmitter2 } from 'eventemitter2';
class ConfigChangeNotifier extends EventEmitter2 implements INotifier<IFlag> {
  broadcast(touchedFlags: IFlag) {
    this.emit('Flag.Change', touchedFlags);
  }
  subscribe(handler: Handler<IFlag>) {
    this.on('Flag.Change', handler);
  }
  unsubscribe(handler: Handler<IFlag>) {
    this.off('Flag.Change', handler);
  }
}
export default ConfigChangeNotifier;
