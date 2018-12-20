/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-17 16:21:08
 * Copyright © RingCentral. All rights reserved.
 */

import { LOG_LEVEL, ILogger } from './ILogger';
class LoggerProxy {
  private _logger: ILogger;

  public setLogger(logger: ILogger): void {
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

  private _doLog(level: LOG_LEVEL, tag: string, message: string): void {
    if (!this._logger) {
      return;
    }
    const msg = this._formatMsg(tag, message);
    this._logger.doLog(level, msg);
  }

  private _formatMsg(tag: string, message: string): string {
    const formatMsg = `${tag}: ${message}`;
    return formatMsg;
  }
}

const rtcLogger = new LoggerProxy();

export { rtcLogger };
