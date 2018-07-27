import { Flag, Handler, Notifier } from './utils';
import { EventEmitter2 } from 'eventemitter2';
class ConfigChangeNotifier extends EventEmitter2 implements Notifier<Flag> {
  broadcast(touchedFlags: Flag) {
    this.emit('Flag.Change', touchedFlags);
  }
  subscribe(handler: Handler<Flag>) {
    this.on('Flag.Change', handler);
  }
  unsubscribe(handler: Handler<Flag>) {
    this.off('Flag.Change', handler);
  }
}
export default ConfigChangeNotifier;
