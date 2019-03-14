/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:22:39
 * Copyright © RingCentral. All rights reserved.
 */
import { LOG_LEVEL } from './constants';
import {
  ILogger,
  LogEntity,
  ILoggerCore,
  ILogEntityProcessor,
  ILogConsumer,
  IConsoleLogPrettier,
} from './types';
import { configManager } from './config';
import { LogEntityProcessor } from './LogEntityProcessor';
import { ConsoleLogPrettier } from './ConsoleLogPrettier';

const buildLogEntity = (
  level: LOG_LEVEL,
  tags: string[],
  params: any[],
): LogEntity => {
  const logEntity = new LogEntity();
  logEntity.level = level;
  logEntity.tags = tags;
  logEntity.params = params;
  return logEntity;
};

export class Logger implements ILogger, ILoggerCore {
  private _logEntityProcessor: ILogEntityProcessor;
  private _logConsumer: ILogConsumer;
  private _consoleLoggerCore: ILoggerCore;
  constructor() {
    this._logEntityProcessor = new LogEntityProcessor();
    this._consoleLoggerCore = new ConsoleLogCore(new ConsoleLogPrettier());
  }

  setConsumer(consumer: ILogConsumer) {
    this._logConsumer = consumer;
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

  tags(...tags: string[]): ILogger {
    return new LoggerTagDecorator(this, tags);
  }

  doLog(logEntity: LogEntity = new LogEntity()) {
    if (!this._isLogEnabled(logEntity)) return;
    this._isBrowserEnabled(logEntity) &&
      this._consoleLoggerCore.doLog(logEntity);
    this._isConsumerEnabled() &&
      this._logConsumer.onLog(this._logEntityProcessor.process(logEntity));
  }

  private _isLogEnabled(logEntity: LogEntity) {
    const { level, filter, enabled } = configManager.getConfig();
    if (logEntity.level < level) return false;
    if (filter && !filter(logEntity)) return false;
    return enabled;
  }

  private _isConsumerEnabled() {
    const {
      consumer: { enabled },
    } = configManager.getConfig();
    return enabled;
  }

  private _isBrowserEnabled(logEntity: LogEntity) {
    const {
      browser: { enabled },
    } = configManager.getConfig();
    return logEntity.level >= LOG_LEVEL.WARN || enabled;
  }
}

class ConsoleLogCore implements ILoggerCore {
  constructor(private _consoleLogPrettier: IConsoleLogPrettier) {}

  doLog(logEntity: LogEntity): void {
    if (typeof window === 'undefined') return;
    this._browserLog(logEntity.level)(
      ...this._consoleLogPrettier.prettier(logEntity),
    );
  }

  private _browserLog(level: LOG_LEVEL): Function {
    switch (level) {
      case LOG_LEVEL.FATAL:
        return window.console.error.bind(window.console);
      case LOG_LEVEL.ERROR:
        return window.console.error.bind(window.console);
      case LOG_LEVEL.WARN:
        return window.console.warn.bind(window.console);
      case LOG_LEVEL.INFO:
        return window.console.info.bind(window.console);
      case LOG_LEVEL.DEBUG:
        return window.console.debug.bind(window.console);
      case LOG_LEVEL.TRACE:
        return window.console.trace.bind(window.console);
      default:
        return window.console.log.bind(window.console);
    }
  }
}

class LoggerTagDecorator implements ILogger {
  constructor(private _loggerCore: ILoggerCore, private _tags: string[]) {}

  log(...params: any) {
    return this._loggerCore.doLog(
      buildLogEntity(LOG_LEVEL.LOG, this._tags, params),
    );
  }

  trace(...params: any) {
    return this._loggerCore.doLog(
      buildLogEntity(LOG_LEVEL.TRACE, this._tags, params),
    );
  }

  debug(...params: any) {
    return this._loggerCore.doLog(
      buildLogEntity(LOG_LEVEL.DEBUG, this._tags, params),
    );
  }

  info(...params: any) {
    return this._loggerCore.doLog(
      buildLogEntity(LOG_LEVEL.INFO, this._tags, params),
    );
  }

  warn(...params: any) {
    return this._loggerCore.doLog(
      buildLogEntity(LOG_LEVEL.WARN, this._tags, params),
    );
  }

  error(...params: any) {
    return this._loggerCore.doLog(
      buildLogEntity(LOG_LEVEL.ERROR, this._tags, params),
    );
  }

  fatal(...params: any) {
    return this._loggerCore.doLog(
      buildLogEntity(LOG_LEVEL.FATAL, this._tags, params),
    );
  }

  tags(...tags: string[]): ILogger {
    return new LoggerTagDecorator(this._loggerCore, this._tags.concat(tags));
  }
}
