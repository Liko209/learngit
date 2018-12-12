import Logger from './Logger';
import BrowserConsoleAppender from './appender/BrowserConsoleAppender';
import PersistentLogAppender from './appender/PersistentLogAppender';
import { LOG_LEVEL, LOG_APPENDER } from './constants';
import DateFormatter from './DateFormatter';

class LogManager {
  private static _instance: LogManager;
  private _loggers: Map<string, Logger>;
  private _dateFormatter: DateFormatter = new DateFormatter();
  private _overThresholdCallback: Function | null = null;

  public constructor(public appenders: LOG_APPENDER = LOG_APPENDER.CONSOLE) {
    this._loggers = new Map();
    this.initMainLogger();
    if (typeof window === 'undefined') {
      return;
    }
    window.onerror = this.windowError.bind(this);
    window.addEventListener('beforeunload', (event: any) => {
      this.doAppend();
    });
  }

  static get Instance() {
    const appenders =
      process.env.NODE_ENV === 'test'
        ? LOG_APPENDER.NONE
        : LOG_APPENDER.CONSOLE;

    this._instance || (this._instance = new this(appenders));
    return this._instance;
  }

  async doAppend(overThreshold: boolean = false) {
    const doAppends: Promise<void>[] = [];
    this._loggers.forEach((logger: Logger) => {
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
      if (this.appenders & LOG_APPENDER.CONSOLE) {
        logger.addAppender('browserConsole', new BrowserConsoleAppender());
      }
      if (this.appenders & LOG_APPENDER.LOCAL_STORAGE) {
        logger.addAppender('persistentLog', new PersistentLogAppender());
      }
      this._loggers.set(categoryName, logger);
    }

    return logger;
  }

  getMainLogger() {
    return this.getLogger('MAIN');
  }

  getNetworkLogger() {
    return this.getLogger('NETWORK');
  }

  initMainLogger() {
    const defaultLogger = this.getMainLogger();
    defaultLogger.setLevel(LOG_LEVEL.ALL);
  }

  setOverThresholdCallback(cb: Function) {
    this._overThresholdCallback = cb;
  }

  setAllLoggerLevel(level: LOG_LEVEL) {
    this._loggers.forEach((logger: Logger) => {
      logger.setLevel(level);
    });
  }

  windowError(msg: string, url: string, line: number) {
    const message = `Error in ('${url ||
      window.location}) on line ${line} with message (${msg})`;
    this.getMainLogger().fatal(message);
  }

  async getLogs(categorys?: string[]) {
    const iterable: Promise<{}>[] = [];

    const handleCategorys = categorys || Array.from(this._loggers.keys());

    handleCategorys
      .map(name => this._loggers.get(name))
      .forEach((logger: Logger) => {
        if (logger) {
          logger.getAppenders().forEach((apppender: any) => {
            if (apppender instanceof PersistentLogAppender) {
              iterable.push(apppender.getLogs());
            }
          });
        }
      });

    return Promise.all(iterable).then((res: any) => {
      const logs = {};
      res.forEach((value: any, index: number) => {
        logs[handleCategorys[index]] = [].concat.apply([], value);
      });
      return logs;
    });
  }

  async clearLogs(categorys?: string[]) {
    const iterable: Promise<void>[] = [];

    const handleCategorys = categorys || Array.from(this._loggers.keys());

    handleCategorys
      .map(name => this._loggers.get(name))
      .forEach((logger: Logger) => {
        if (logger) {
          logger.getAppenders().forEach((apppender: any) => {
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
