import Logger from './Logger';
import BrowserConsoleAppender from './appender/BrowserConsoleAppender';
import PersistentLogAppender from './appender/PersistentLogAppender';
import { LOG_LEVEL } from './constants';
import DateFormatter from './DateFormatter';

class LogManager {
  private static _instance: LogManager;
  private _loggers: Map<string, Logger>;
  private _dateFormatter: DateFormatter = new DateFormatter();
  private _overThresholdCallback: Function | null = null;

  private constructor() {
    this._loggers = new Map();
    this.initMainLogger();

    window.onerror = this.windowError.bind(this);
    window.addEventListener('beforeunload', (event) => {
      this.doAppend();
    });
  }

  static get Instance() {
    this._instance = this._instance || (this._instance = new this());
    return this._instance;
  }

  async doAppend(overThreshold: boolean = false) {
    const doAppends: Promise<void>[] = [];
    this._loggers.forEach((logger) => {
      doAppends.push(logger.doAppend());
    });

    await Promise.all(doAppends);

    if (overThreshold && this._overThresholdCallback) {
      // notifiy over threshold to do upload
      this._overThresholdCallback();
    }
  }

  getLogger(categoryName: string) {
    let logger = this._loggers.get(categoryName);
    if (!logger) {
      // Create the logger for this name if it doesn't already exist
      logger = new Logger(categoryName);
      logger.setDateFormatter(this._dateFormatter);
      logger.addAppender('browserConsole', new BrowserConsoleAppender());
      logger.addAppender('persistentLog', new PersistentLogAppender());
      this._loggers.set(categoryName, logger);
    }

    return logger;
  }

  getMainLogger() {
    return this.getLogger('MAIN');
  }

  initMainLogger() {
    const defaultLogger = this.getMainLogger();
    defaultLogger.setLevel(LOG_LEVEL.ALL);
  }

  setOverThresholdCallback(cb: Function) {
    this._overThresholdCallback = cb;
  }

  setAllLoggerLevel(level: LOG_LEVEL) {
    this._loggers.forEach((logger) => {
      logger.setLevel(level);
    });
  }

  windowError(msg: string, url: string, line: number) {
    const message = `Error in ('${(url || window.location)}) on line ${line} with message (${msg})`;
    this.getMainLogger().fatal(message);
  }

  async getLogs(categorys?: string[]) {
    const iterable: Promise<{}>[] = [];

    const handleCategorys = categorys || Array.from(this._loggers.keys());

    handleCategorys.map(name => this._loggers.get(name)).forEach((logger) => {
      if (logger) {
        logger.getAppenders().forEach((apppender) => {
          if (apppender instanceof PersistentLogAppender) {
            iterable.push(apppender.getLogs());
          }
        });
      }
    });

    return Promise.all(iterable).then((res) => {
      const logs = {};
      res.forEach((value, index) => {
        logs[handleCategorys[index]] = [].concat.apply([], value);
      });
      return logs;
    });
  }

  async clearLogs(categorys?: string[]) {
    const iterable: Promise<void>[] = [];

    const handleCategorys = categorys || Array.from(this._loggers.keys());

    handleCategorys.map(name => this._loggers.get(name)).forEach((logger) => {
      if (logger) {
        logger.getAppenders().forEach((apppender) => {
          if (apppender instanceof PersistentLogAppender) {
            iterable.push(apppender.doClear());
          }
        });
      }
    });

    return Promise.all(iterable);
  }
}

export default LogManager;
