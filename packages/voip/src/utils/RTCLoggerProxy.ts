/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-17 16:21:08
 * Copyright © RingCentral. All rights reserved.
 */
import { mainLogger } from 'foundation';
import { LOG_LEVEL, IRTCLogger } from './IRTCLogger';
class RTCLoggerProxy {
  private _logger: IRTCLogger;

  public setLogger(logger: IRTCLogger): void {
    this._logger = logger;
  }

  public info(tag: string, message: string): void {
    this._doLog(LOG_LEVEL.INFO, tag, message);
  }

  public debug(tag: string, message: string): void {
    this._doLog(LOG_LEVEL.DEBUG, tag, message);
  }

  public warn(tag: string, message: string): void {
    this._doLog(LOG_LEVEL.WARN, tag, message);
  }

  public error(tag: string, message: string): void {
    this._doLog(LOG_LEVEL.ERROR, tag, message);
  }

  public fatal(tag: string, message: string): void {
    this._doLog(LOG_LEVEL.FATAL, tag, message);
  }

  public trace(tag: string, message: string): void {
    this._doLog(LOG_LEVEL.TRACE, tag, message);
  }

  private _loglevelString(level: LOG_LEVEL): string {
    switch (level) {
      case LOG_LEVEL.FATAL:
        return 'Fatal';
      case LOG_LEVEL.WARN:
        return 'Warning';
      case LOG_LEVEL.ERROR:
        return 'Error';
      case LOG_LEVEL.DEBUG:
        return 'Debug';
      case LOG_LEVEL.INFO:
        return 'Info';
      case LOG_LEVEL.TRACE:
        return 'Trace';
    }
  }

  private _doLog(level: LOG_LEVEL, tag: string, message: string): void {
    if (!this._logger) {
      const msg = this._formatMsg(tag, message);
      mainLogger.info(
        `[${new Date().toISOString()}][${this._loglevelString(level)}] ${msg}`,
      );
      return;
    }
    const msg = this._formatMsg(tag, message);
    this._logger.doLog(level, msg);
  }

  private _formatMsg(tag: string, message: string): string {
    const formatMsg = `${tag}: ${message}`;
    return formatMsg;
  }

  public loggerConnector(
    level: string,
    category: string,
    label: string,
    content: string,
  ): void {
    const tag = `VoIP-Sip: ${category} [${label}]`;
    switch (level) {
      case 'debug':
        this.debug(tag, content);
        break;
      case 'log':
        this.info(tag, content);
        break;
      case 'warn':
        this.warn(tag, content);
        break;
      case 'error':
        this.error(tag, content);
        break;
    }
  }
}

const rtcLogger = new RTCLoggerProxy();

export { rtcLogger };
