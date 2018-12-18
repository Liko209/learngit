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
    const msg = this._formatMsg(tag, message);
    this._logger.doLog(LOG_LEVEL.INFO, msg);
  }

  public debug(tag: string, message: string): void {
    const msg = this._formatMsg(tag, message);
    this._logger.doLog(LOG_LEVEL.DEBUG, msg);
  }

  public warn(tag: string, message: string): void {
    const msg = this._formatMsg(tag, message);
    this._logger.doLog(LOG_LEVEL.WARN, msg);
  }

  public error(tag: string, message: string): void {
    const msg = this._formatMsg(tag, message);
    this._logger.doLog(LOG_LEVEL.ERROR, msg);
  }

  public fatal(tag: string, message: string): void {
    const msg = this._formatMsg(tag, message);
    this._logger.doLog(LOG_LEVEL.FATAL, msg);
  }

  public trace(tag: string, message: string): void {
    const msg = this._formatMsg(tag, message);
    this._logger.doLog(LOG_LEVEL.TRACE, msg);
  }

  private _formatMsg(tag: string, message: string): string {
    const splitSymbol = ': ';
    const formatMsg = tag + splitSymbol + message;
    return formatMsg;
  }
}

const rtcLogger = new LoggerProxy();

export { rtcLogger };
