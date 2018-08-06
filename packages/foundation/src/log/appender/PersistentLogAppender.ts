import localforage from 'localforage';
import BaseAppender from '../AppenderAbstract';
import LoggingEvent from '../LoggingEvent';
import emitter from '../emitter';
import { LOG_LEVEL_STRING } from '../constants';

class PersistentLogAppender extends BaseAppender {
  private LOG_SYNC_WEIGHT: number = 1000;
  private _loggingEvents: LoggingEvent[] = [];
  private _getedKeyName: string;
  private _logSize: number = 0;
  private LOG_SYNC_LENGTH: number = 1024 * 1024;

  doLog(loggingEvent: LoggingEvent) {
    this._loggingEvents.push(loggingEvent);
    this._logSize = this._logSize + loggingEvent.getMessage().length;
    if (
      this._logSize > this.LOG_SYNC_LENGTH ||
      this._loggingEvents.length > this.LOG_SYNC_WEIGHT
    ) {
      emitter.emitAsync('doAppend', true);
    }
  }

  async doAppend() {
    if (!this._loggingEvents.length) {
      return;
    }
    const logs: string[] = this._loggingEvents.map(this.format.bind(this));
    const firstKey = this._loggingEvents[0].getStartTimestamp();
    const lastKey = this._loggingEvents[this._loggingEvents.length - 1
].getStartTimestamp();
    const key = `${firstKey} - ${lastKey}`;
    this._loggingEvents = [];

    const category = this.logger.getCategory();
    const store = this._getStore(category);
    store.setItem(key, logs);
  }

  async doClear() {
    if (this._getedKeyName) {
      this.doRemove(this._getedKeyName);
      return;
    }
    const category = this.logger.getCategory();
    return this._getStore(category).clear();
  }

  async doRemove(keys: string[] | string) {
    const category = this.logger.getCategory();
    const store = this._getStore(category);
    const storeHandlers: Promise<void>[] = [];
    if (Array.isArray(keys)) {
      keys.forEach((key) => {
        storeHandlers.push(store.removeItem(key));
      });
    } else {
      storeHandlers.push(store.removeItem(keys));
    }

    return Promise.all(storeHandlers);
  }

  format(loggingEvent: LoggingEvent) {
    const level = loggingEvent.getLevel();
    const message = loggingEvent.getMessage();
    const category = this.logger.getCategory();
    const levelStr = LOG_LEVEL_STRING[level];
    const formattedTimestamp = loggingEvent.getFormattedTimestamp();
    return `${category} [${formattedTimestamp}] [${levelStr}]: ${message}`;
  }

  async getLogs() {
    const category = this.logger.getCategory();
    const store = this._getStore(category);
    this._getedKeyName = await store.key(0);
    return store.getItem(this._getedKeyName);
  }

  private _getStore(name: string): LocalForage {
    return localforage.createInstance({
      name,
      storeName: 'log',
    });
  }
}

export default PersistentLogAppender;
