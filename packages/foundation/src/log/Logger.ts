/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:22:39
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { LOG_LEVEL } from './constants';
import {
  ILogger, LogEntity, ILoggerCore, ILogEntityProcessor, ILogCollector, IConsoleLogPrettier
} from './types';
import { configManager } from './config';
import { LogEntityProcessor } from './LogEntityProcessor';
import { ConsoleLogPrettier } from './ConsoleLogPrettier';

const buildLogEntity = (level: LOG_LEVEL, tags: string[], params: any[]): LogEntity => {
  const logEntity = new LogEntity();
  logEntity.level = level;
  logEntity.tags = tags;
  logEntity.params = params;
  return logEntity;
};

class ConsoleLogCore implements ILoggerCore {
  constructor(private _consoleLogPrettier: IConsoleLogPrettier) {}
  doLog(logEntity: LogEntity): void {
    if (typeof window === 'undefined') {
      return;
    }

    this._browserLog(logEntity.level, this._consoleLogPrettier.prettier(logEntity));
  }

  private _browserLog(level: LOG_LEVEL, params: any[]) {
    switch (level) {
      case LOG_LEVEL.FATAL:
        window.console.error(...params);
        break;
      case LOG_LEVEL.ERROR:
        window.console.error(...params);
        break;
      case LOG_LEVEL.WARN:
        window.console.warn(...params);
        break;
      case LOG_LEVEL.INFO:
        window.console.info(...params);
        break;
      case LOG_LEVEL.DEBUG:
        window.console.debug(...params);
        break;
      case LOG_LEVEL.TRACE:
        window.console.trace(...params);
        break;
      default:
        window.console.log(...params);
        break;
    }
  }
}
class LoggerTagDecorator implements ILogger {
  constructor(private _loggerCore: ILoggerCore, private _tags: string[]) {}

  log(...params: any) {
    return this._loggerCore.doLog(buildLogEntity(LOG_LEVEL.LOG, this._tags, params));
  }

  trace(...params: any) {
    return this._loggerCore.doLog(buildLogEntity(LOG_LEVEL.TRACE, this._tags, params));
  }

  debug(...params: any) {
    return this._loggerCore.doLog(buildLogEntity(LOG_LEVEL.DEBUG, this._tags, params));
  }

  info(...params: any) {
    return this._loggerCore.doLog(buildLogEntity(LOG_LEVEL.INFO, this._tags, params));
  }

  warn(...params: any) {
    return this._loggerCore.doLog(buildLogEntity(LOG_LEVEL.WARN, this._tags, params));
  }

  error(...params: any) {
    return this._loggerCore.doLog(buildLogEntity(LOG_LEVEL.ERROR, this._tags, params));
  }

  fatal(...params: any) {
    return this._loggerCore.doLog(buildLogEntity(LOG_LEVEL.FATAL, this._tags, params));
  }

  tags(...tags: string[]): ILogger {
    return new LoggerTagDecorator(this._loggerCore, this._tags.concat(tags));
  }
}

export class Logger implements ILogger, ILoggerCore {
  private _logEntityProcessor: ILogEntityProcessor;
  private _logCollectors: ILogCollector[] = [];
  private _consoleLoggerCore: ILoggerCore;
  private _memoizeTags: ((_tags: string[]) => ILogger) & _.MemoizedFunction;
  constructor() {
    this._logEntityProcessor = new LogEntityProcessor();
    this._consoleLoggerCore = new ConsoleLogCore(new ConsoleLogPrettier());
    this._memoizeTags = _.memoize((_tags: string[]): ILogger => new LoggerTagDecorator(this, _tags), (_tags: string[]) => _tags.join(','));
  }

  addCollector(collector: ILogCollector) {
    this._logCollectors = [...this._logCollectors, collector];
  }

  removeCollector(collector: ILogCollector) {
    this._logCollectors = this._logCollectors.filter(it => it === collector);
  }

  log(...params: any) {
    return this.doLog(buildLogEntity(LOG_LEVEL.LOG, [], params));
  }

  trace(...params: any) {
    return this.doLog(buildLogEntity(LOG_LEVEL.TRACE, [], params));
  }

  debug(...params: any) {
    return this.doLog(buildLogEntity(LOG_LEVEL.DEBUG, [], params));
  }

  info(...params: any) {
    return this.doLog(buildLogEntity(LOG_LEVEL.INFO, [], params));
  }

  warn(...params: any) {
    return this.doLog(buildLogEntity(LOG_LEVEL.WARN, [], params));
  }

  error(...params: any) {
    return this.doLog(buildLogEntity(LOG_LEVEL.ERROR, [], params));
  }

  fatal(...params: any) {
    return this.doLog(buildLogEntity(LOG_LEVEL.FATAL, [], params));
  }

  tags = (...tags: string[]): ILogger => this._memoizeTags(tags);

  doLog(logEntity: LogEntity = new LogEntity()) {
    if (!this._isLogEnabled(logEntity)) return;
    this._isBrowserEnabled(logEntity) && this._consoleLoggerCore.doLog(logEntity);
    if (this._isCollectorEnabled()) {
      const log = this._logEntityProcessor.process(logEntity);
      this._logCollectors.forEach((logCollector: ILogCollector) => {
        logCollector.onLog(log);
      });
    }
  }

  private _isLogEnabled(logEntity: LogEntity) {
    const { level, filter, enabled } = configManager.getConfig();
    if (logEntity.level < level) return false;
    if (filter && !filter(logEntity)) return false;
    return enabled;
  }

  private _isCollectorEnabled() {
    const {
      collector: { enabled },
    } = configManager.getConfig();
    return enabled && this._logCollectors.length > 0;
  }

  private _isBrowserEnabled(logEntity: LogEntity) {
    const {
      browser: { enabled },
    } = configManager.getConfig();
    return logEntity.level >= LOG_LEVEL.WARN || enabled;
  }
}
