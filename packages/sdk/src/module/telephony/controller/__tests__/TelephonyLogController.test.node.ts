/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-31 21:44:08
 * Copyright © RingCentral. All rights reserved.
 */
import { telephonyLogger } from 'foundation/log';
import { TelephonyLogController } from '../TelephonyLogController';
import { LOG_LEVEL } from 'voip';

describe('TelephonyLogController', () => {
  const LOG_MSG = 'test';
  it('should call main logger with debug level', () => {
    const logger = new TelephonyLogController();
    jest.spyOn(telephonyLogger, 'debug');
    logger.doLog(LOG_LEVEL.DEBUG, LOG_MSG);
    expect(telephonyLogger.debug).toBeCalledWith(LOG_MSG);
  });
  it('should call main logger with info level', () => {
    const logger = new TelephonyLogController();
    jest.spyOn(telephonyLogger, 'info');
    logger.doLog(LOG_LEVEL.INFO, LOG_MSG);
    expect(telephonyLogger.info).toBeCalledWith(LOG_MSG);
  });

  it('should call main logger with warn level', () => {
    const logger = new TelephonyLogController();
    jest.spyOn(telephonyLogger, 'warn');
    logger.doLog(LOG_LEVEL.WARN, LOG_MSG);
    expect(telephonyLogger.warn).toBeCalledWith(LOG_MSG);
  });

  it('should call main logger with error level', () => {
    const logger = new TelephonyLogController();
    jest.spyOn(telephonyLogger, 'error');
    logger.doLog(LOG_LEVEL.ERROR, LOG_MSG);
    expect(telephonyLogger.error).toBeCalledWith(LOG_MSG);
  });

  it('should call main logger with fatal level', () => {
    const logger = new TelephonyLogController();
    jest.spyOn(telephonyLogger, 'fatal');
    logger.doLog(LOG_LEVEL.FATAL, LOG_MSG);
    expect(telephonyLogger.fatal).toBeCalledWith(LOG_MSG);
  });

  it('should call main logger with trace level', () => {
    const logger = new TelephonyLogController();
    jest.spyOn(telephonyLogger, 'trace');
    logger.doLog(LOG_LEVEL.TRACE, LOG_MSG);
    expect(telephonyLogger.trace).toBeCalledWith(LOG_MSG);
  });

  it('should call main logger with info level when log level is unexpected', () => {
    const logger = new TelephonyLogController();
    jest.spyOn(telephonyLogger, 'info');
    logger.doLog(1, LOG_MSG);
    expect(telephonyLogger.info).toBeCalledWith(LOG_MSG);
  });
});
