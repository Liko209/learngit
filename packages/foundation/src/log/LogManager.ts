import { Logger } from './Logger';
import { LOG_LEVEL, LOG_TAGS } from './constants';
import { ILogger, ILogLoader, LogConfig } from './types';
import { configManager } from './config';
import mergeWith from 'lodash/mergeWith';
import { MessageLoader, SessionLoader, StringCutLoader, TimestampLoader } from './loaders';
import { LogConsumer, LogPersistence } from './consumer';

type LoaderMap = {
  [name: string]: ILogLoader,
};

type LoaderItem = {
  loader: string | ILogLoader,
  options?: object,
};
class LogManager {
  private static _instance: LogManager;
  private _loggers: Map<string, ILogger>;
  private _logger: Logger;
  private _logConsumer: LogConsumer;
  private _defaultLoaderMap: LoaderMap;

  public constructor() {
    this._loggers = new Map();
    this._defaultLoaderMap = {
      SessionLoader: new SessionLoader(),
      StringCutLoader: new StringCutLoader(),
      TimestampLoader: new TimestampLoader(),
      MessageLoader: new MessageLoader(),
    };
    configManager.mergeConfig({
      persistence: new LogPersistence(),
    });
    this.configLoaders([
      {
        loader: 'SessionLoader',
      },
      {
        loader: 'StringCutLoader',
        options: {
          limit: 2000,
        },
      },
      {
        loader: 'TimestampLoader',
      },
      {
        loader: 'MessageLoader',
      },
    ]);
    this._logger = new Logger();
    this._logConsumer = new LogConsumer();
    this._logConsumer.setLogPersistence(new LogPersistence());
    this._logger.setConsumer(this._logConsumer);
    if (typeof window !== 'undefined') {
      window.onerror = this.windowError.bind(this);
      window.addEventListener('beforeunload', (event: any) => {
        this.flush();
      });
    }
  }

  static get Instance() {
    this._instance || (this._instance = new this());
    return this._instance;
  }

  flush() {
    this._logConsumer.flush();
  }

  configAll(config: LogConfig) {
    configManager.setConfig(config);
  }

  config(config: Partial<LogConfig>) {
    configManager.mergeConfig(config);
    return this;
  }

  configLoaders(loaderItems: LoaderItem[], customLoaderMap?: LoaderMap) {
    const loaderMap = customLoaderMap ? mergeWith({}, this._defaultLoaderMap, customLoaderMap) : this._defaultLoaderMap;
    const loaders: ILogLoader[] = (loaderItems || []).map((loaderItem) => {
      if (Object.prototype.toString.call(loaderItem.loader) === '[object String]') {
        const loader: ILogLoader = loaderMap[loaderItem.loader as string];
        loader.options = loaderItem.options || {};
        return loader;
      }
      return loaderItem.loader as ILogLoader;
    });
    configManager.mergeConfig({
      loaders,
    });
    return this;
  }

  getLogger(categoryName: string): ILogger {
    let logger = this._loggers.get(categoryName);
    if (!logger) {
      logger = this._logger.tags(categoryName);
      this._loggers.set(categoryName, logger);
    }
    return logger;
  }

  getMainLogger(): ILogger {
    return this.getLogger(LOG_TAGS.MAIN);
  }

  getNetworkLogger(): ILogger {
    return this.getLogger(LOG_TAGS.NETWORK);
  }

  setAllLoggerLevel(level: LOG_LEVEL) {
    configManager.mergeConfig({
      level,
    });
  }

  windowError(msg: string, url: string, line: number) {
    const message = `Error in ('${url ||
      window.location}) on line ${line} with message (${msg})`;
    this.getMainLogger().fatal(message);
    this.flush();
  }

}

export default LogManager;
