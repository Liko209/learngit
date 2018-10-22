import Logger from './Logger';

import { LOG_LEVEL } from './constants';

class LoggingEvent {
  private _startTime: Date = new Date();
  private _message: string;
  private _level: LOG_LEVEL;
  private _logger: Logger;

  constructor(level: LOG_LEVEL, message: string, logger: Logger) {
    this._message = message;
    this._level = level;
    this._logger = logger;
  }

  getFormattedTimestamp() {
    if (this._logger) {
      return this._logger.getFormattedTimestamp(this._startTime);
    }
    return this._startTime.toISOString();
  }

  getLevel() {
    return this._level;
  }

  getMessage() {
    return this._message;
  }

  getStartTimestamp() {
    return this._startTime.getTime();
  }
}

export default LoggingEvent;
