import { Logger } from './Logger';
import { LOG_LEVEL, LOG_TAGS } from './constants';
import { ILogger, ILogEntityDecorator, LogConfig } from './types';
import { configManager } from './config';
import mergeWith from 'lodash/mergeWith';
import {
  MessageDecorator,
  SessionDecorator,
  TruncationDecorator,
  TimestampDecorator,
} from './decorators';
import { LogConsumer, LogPersistence } from './consumer';

type LoaderMap = {
  [name: string]: ILogEntityDecorator;
};

type LoaderItem = {
  loader: string | ILogEntityDecorator;
  options?: object;
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
      SessionDecorator: new SessionDecorator(),
      TruncationDecorator: new TruncationDecorator(),
      TimestampDecorator: new TimestampDecorator(),
      MessageDecorator: new MessageDecorator(),
    };
    configManager.mergeConfig({
      persistence: new LogPersistence(),
    });
    this.configDecorators([
      {
        loader: 'SessionDecorator',
      },
      {
        loader: 'TruncationDecorator',
        options: {
          limit: 2000,
        },
      },
      {
        loader: 'TimestampDecorator',
      },
      {
        loader: 'MessageDecorator',
      },
    ]);
    this._logger = new Logger();
    this._logConsumer = new LogConsumer();
    this._logConsumer.setLogPersistence(new LogPersistence());
    this._logger.setConsumer(this._logConsumer);
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.windowError.bind(this));
      window.addEventListener('beforeunload', (event: any) => {
        this.flush();
      });
    }
    if (process.env.NODE_ENV === 'test') {
      configManager.mergeConfig({
        enabled: false,
        browser: {
          enabled: false,
        },
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

  configDecorators(loaderItems: LoaderItem[], customLoaderMap?: LoaderMap) {
    const loaderMap = customLoaderMap
      ? mergeWith({}, this._defaultLoaderMap, customLoaderMap)
      : this._defaultLoaderMap;
    const decorators: ILogEntityDecorator[] = (loaderItems || []).map(
      (loaderItem: LoaderItem) => {
        if (
          Object.prototype.toString.call(loaderItem.loader) ===
          '[object String]'
        ) {
          const loader: ILogEntityDecorator =
            loaderMap[loaderItem.loader as string];
          loader.options = loaderItem.options || {};
          return loader;
        }
        return loaderItem.loader as ILogEntityDecorator;
      },
    );
    configManager.mergeConfig({
      decorators,
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
