import BaseAppender from '../AppenderAbstract';
import LoggingEvent from '../LoggingEvent';
import { LOG_LEVEL, LOG_LEVEL_STRING, LINE_SEP } from '../constants';

class BrowserConsoleAppender extends BaseAppender {
  doLog(loggingEvent: LoggingEvent) {
    const level = loggingEvent.getLevel();
    let browserConsole;
    switch (level) {
      case LOG_LEVEL.FATAL:
        browserConsole = window.console.error;
        break;
      case LOG_LEVEL.ERROR:
        browserConsole = window.console.error;
        break;
      case LOG_LEVEL.WARN:
        browserConsole = window.console.warn;
        break;
      case LOG_LEVEL.INFO:
        browserConsole = window.console.info;
        break;
      case LOG_LEVEL.DEBUG:
        browserConsole = window.console.debug;
        break;
      case LOG_LEVEL.TRACE:
        browserConsole = window.console.trace;
        break;
      default:
        browserConsole = window.console.log;
    }

    browserConsole = browserConsole.bind(window.console);

    browserConsole(this.format(loggingEvent));
  }

  doAppend() {
    const loggingEvent = new LoggingEvent(
      LOG_LEVEL.INFO,
      'do append',
      this.logger,
    );
    this.doLog(loggingEvent);
  }

  doClear() {
    window.console.clear();
  }

  format(loggingEvent: LoggingEvent) {
    const level = loggingEvent.getLevel();
    const message = loggingEvent.getMessage();
    const category = this.logger.getCategory();
    const levelStr = LOG_LEVEL_STRING[level];
    const formattedTimestamp = loggingEvent.getFormattedTimestamp();
    return `${category} [${formattedTimestamp}] [${levelStr}]: ${message}${LINE_SEP}`;
  }
}

export default BrowserConsoleAppender;
