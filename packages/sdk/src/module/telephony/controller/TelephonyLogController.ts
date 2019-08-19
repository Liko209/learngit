/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-31 21:31:33
 * Copyright © RingCentral. All rights reserved.
 */
import { IRTCLogger, LOG_LEVEL } from 'voip';
import { telephonyLogger } from 'foundation/log';

class TelephonyLogController implements IRTCLogger {
  doLog(level: LOG_LEVEL, message: string) {
    switch (level) {
      case LOG_LEVEL.DEBUG:
        telephonyLogger.debug(message);
        break;
      case LOG_LEVEL.ERROR:
        telephonyLogger.error(message);
        break;
      case LOG_LEVEL.FATAL:
        telephonyLogger.fatal(message);
        break;
      case LOG_LEVEL.INFO:
        telephonyLogger.info(message);
        break;
      case LOG_LEVEL.TRACE:
        telephonyLogger.trace(message);
        break;
      case LOG_LEVEL.WARN:
        telephonyLogger.warn(message);
        break;
      default:
        telephonyLogger.info(message);
        break;
    }
  }
}

export { TelephonyLogController };
