import BaseAppender from './AppenderAbstract';
import LoggingEvent from './LoggingEvent';
import DateFormatter from './DateFormatter';

import { LOG_LEVEL, DATE_FORMATTER } from './constants';

class Logger {
  private _appenders: Map<string, BaseAppender> = new Map();
  private _category: string;
  private _level: LOG_LEVEL = LOG_LEVEL.FATAL;
  private _dateFormat: DATE_FORMATTER = DATE_FORMATTER.DEFAULT_DATE_FORMAT;
  private _dateFormatter: DateFormatter;

  constructor(name: string) {
    this._category = name;
  }

  addAppender<T extends BaseAppender>(name: string, appender: T) {
    appender.setLogger(this);
    this._appenders.set(name, appender);
  }

  removeAppender(name: string) {
    this._appenders.delete(name);
  }

  setAppenders(appenders: Map<string, BaseAppender>) {
    this.clear();

    this._appenders = appenders;

    this._appenders.forEach(appender => {
      appender.setLogger(this);
    });
  }

  getAppenders() {
    return this._appenders;
  }

  setLevel(level: LOG_LEVEL) {
    this._level = level;
  }

  clear() {
    this._appenders.forEach(appender => {
      appender.clear();
    });
  }

  trace(message: string) {
    this.log(LOG_LEVEL.TRACE, message);
  }

  debug(message: string) {
    this.log(LOG_LEVEL.DEBUG, message);
  }

  info(message: string) {
    this.log(LOG_LEVEL.INFO, message);
  }

  warn(message: string) {
    this.log(LOG_LEVEL.WARN, message);
  }

  error(message: string) {
    this.log(LOG_LEVEL.ERROR, message);
  }

  fatal(message: string) {
    this.log(LOG_LEVEL.FATAL, message);
  }

  /**
   * Set the date format of logger. Following switches are supported:
   * <ul>
   * <li>yyyy - The year</li>
   * <li>MM - the month</li>
   * <li>dd - the day of month<li>
   * <li>hh - the hour<li>
   * <li>mm - minutes</li>
   * <li>O - timezone offset</li>
   * </ul>
   * @param {String} format format String for the date
   * @see {@getTimestamp}
   */
  setDateFormat(format: DATE_FORMATTER) {
    this._dateFormat = format;
  }

  setDateFormatter(dateformatter: DateFormatter) {
    this._dateFormatter = dateformatter;
  }

  getFormattedTimestamp(date: Date) {
    return this._dateFormatter.formatDate(date, this._dateFormat);
  }

  getCategory() {
    return this._category;
  }

  canDoLog(logLevel: LOG_LEVEL) {
    if (this._level <= logLevel) {
      return true;
    }
    return false;
  }

  log(logLevel: LOG_LEVEL, message: string) {
    if (this.canDoLog(logLevel)) {
      this.dolog(logLevel, message);
    }
  }

  doAppend() {
    this._appenders.forEach(appender => {
      appender.doAppend();
    });
  }

  private dolog(logLevel: LOG_LEVEL, message: string) {
    const loggingEvent = new LoggingEvent(logLevel, message, this);
    this._appenders.forEach(appender => {
      appender.log(loggingEvent);
    });
  }
}

export default Logger;
