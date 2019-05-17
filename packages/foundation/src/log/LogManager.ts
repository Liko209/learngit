import { Logger } from './Logger';
import { LOG_LEVEL, LOG_TAGS } from './constants';
import {
  ILogger,
  ILogEntityDecorator,
  LogConfig,
  ILogCollector,
} from './types';
import { configManager } from './config';
import mergeWith from 'lodash/mergeWith';
import {
  MessageDecorator,
  SessionDecorator,
  TruncationDecorator,
  TimestampDecorator,
  StringifyDecorator,
} from './decorators';

type LoaderMap = {
  [name: string]: ILogEntityDecorator;
};

type LoaderItem = {
  loader: string | ILogEntityDecorator;
  options?: object;
};
export class LogManager {
  private static _instance: LogManager;
  private _loggers: Map<string, ILogger>;
  private _logger: Logger;
  private _defaultLoaderMap: LoaderMap;

  public constructor() {
    const { truncateThreshold } = configManager.getConfig();
    this._loggers = new Map();
    this._defaultLoaderMap = {
      SessionDecorator: new SessionDecorator(),
      TruncationDecorator: new TruncationDecorator(),
      TimestampDecorator: new TimestampDecorator(),
      MessageDecorator: new MessageDecorator(),
      StringifyDecorator: new StringifyDecorator(),
    };
    this.configDecorators([
      {
        loader: 'SessionDecorator',
      },
      {
        loader: 'StringifyDecorator',
      },
      {
        loader: 'TruncationDecorator',
        options: {
          limit: truncateThreshold,
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
    if (process.env.NODE_ENV === 'test') {
      configManager.mergeConfig({
        enabled: false,
        browser: {
          enabled: true,
        },
      });
    }
  }

  static getInstance() {
    this._instance || (this._instance = new this());
    return this._instance;
  }

  addCollector(collector: ILogCollector) {
    this._logger.addCollector(collector);
  }

  removeCollector(collector: ILogCollector) {
    this._logger.removeCollector(collector);
  }

  configAll(config: LogConfig) {
    configManager.setConfig(config);
  }

  config(config: Partial<LogConfig>) {
    configManager.mergeConfig(config);
    return this;
  }

  getConfig() {
    return configManager.getConfig();
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

  getTelephonyLogger(): ILogger {
    return this.getLogger(LOG_TAGS.TELEPHONY);
  }

  setAllLoggerLevel(level: LOG_LEVEL) {
    configManager.mergeConfig({
      level,
    });
  }
}
