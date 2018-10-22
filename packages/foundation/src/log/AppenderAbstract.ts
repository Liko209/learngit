import Logger from './Logger';
import LoggingEvent from './LoggingEvent';

abstract class AppenderAbstract {
  protected logger: Logger;

  protected abstract doLog(loggingEvent: LoggingEvent): void;

  protected abstract doClear(): void;

  protected abstract format(loggingEvent: LoggingEvent): string;

  abstract doAppend(): void;

  setLogger(logger: Logger) {
    this.logger = logger;
  }

  clear() {
    this.doClear();
  }

  log(loggingEvent: LoggingEvent) {
    this.doLog(loggingEvent);
  }
}

export default AppenderAbstract;
