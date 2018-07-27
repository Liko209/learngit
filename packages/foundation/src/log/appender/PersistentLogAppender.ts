import localforage from 'localforage';
import BaseAppender from '../AppenderAbstract';
import LoggingEvent from '../LoggingEvent';
import emitter from '../emitter';
import { LOG_LEVEL_STRING } from '../constants';

class PersistentLogAppender extends BaseAppender {
  private LOG_SYNC_WEIGHT: number = 1000;
  private _loggingEvents: LoggingEvent[] = [];
  private _getedKeys: string[] = [];

  doLog(loggingEvent: LoggingEvent) {
    this._loggingEvents.push(loggingEvent);
    if (this._loggingEvents.length > this.LOG_SYNC_WEIGHT) {
      emitter.emitAsync('doAppend');
    }
  }

  async doAppend() {
    if (!this._loggingEvents.length) {
      return;
    }
    const logs: string[] = this._loggingEvents.map(this.format.bind(this));
    const firstKey = this._loggingEvents[0].getStartTimestamp();
    const lastKey = this._loggingEvents[
      this._loggingEvents.length - 1
    ].getStartTimestamp();
    const key = `${firstKey} - ${lastKey}`;
    this._loggingEvents = [];

    const category = this.logger.getCategory();
    const store = this._getStore(category);
    store.setItem(key, logs);
  }

  async doClear() {
    if (this._getedKeys.length) {
      this.doRemove(this._getedKeys);
      return;
    }
    const category = this.logger.getCategory();
    return this._getStore(category).clear();
  }

  async doRemove(keys: string[]) {
    const category = this.logger.getCategory();
    const store = this._getStore(category);
    const storeHandlers: Promise<void>[] = [];
    keys.forEach(key => {
      storeHandlers.push(store.removeItem(key));
    });

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

    const iterable: Promise<string[]>[] = [];
    this._getedKeys = await store.keys();
    this._getedKeys.forEach(key => {
      iterable.push(store.getItem(key));
    });

    return Promise.all(iterable);
  }

  private _getStore(name: string): LocalForage {
    return localforage.createInstance({
      name,
      storeName: 'log'
    });
  }
}

export default PersistentLogAppender;
