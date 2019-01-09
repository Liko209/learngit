/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-17 14:30:07
 * Copyright © RingCentral. All rights reserved.
 */

enum LOG_LEVEL {
  FATAL = 'FATAL',
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE',
}

interface IRTCLogger {
  doLog(level: LOG_LEVEL, message: string): void;
}
export { LOG_LEVEL, IRTCLogger };
