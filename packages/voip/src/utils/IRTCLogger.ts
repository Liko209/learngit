/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-17 14:30:07
 * Copyright © RingCentral. All rights reserved.
 */

enum LOG_LEVEL {
  FATAL = 50000,
  ERROR = 40000,
  WARN = 30000,
  INFO = 20000,
  DEBUG = 10000,
  TRACE = 5000,
}
interface IRTCLogger {
  doLog(level: LOG_LEVEL, message: string): void;
}
export { LOG_LEVEL, IRTCLogger };
