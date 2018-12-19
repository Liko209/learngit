/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-18 14:57:49
 * Copyright © RingCentral. All rights reserved.
 */

import { rtcLogger } from '../LoggerProxy';
import { RTCEngine } from '../../api/rtcEngine';
import { LOG_LEVEL, ILogger } from '../ILogger';

class LoggerImpl implements ILogger {
  doLog = jest.fn();
}

describe('LoggerProxy', async () => {
  describe('info', () => {
    it('Should empty due to not insert logger', async () => {
      const loggerImpl = new LoggerImpl();
      rtcLogger.info('VoIP', 'info');
      expect(loggerImpl.doLog.mock.calls.length).toBe(0);
    });
  });

  describe('info', () => {
    it('Should log info message', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.info('VoIP', 'info');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.INFO,
        'VoIP: info',
      );
    });
  });

  describe('debug', () => {
    it('Should log debug message', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.debug('VoIP', 'debug');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.DEBUG,
        'VoIP: debug',
      );
    });
  });

  describe('warn', () => {
    it('Should log warn message', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.warn('VoIP', 'warn');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.WARN,
        'VoIP: warn',
      );
    });
  });

  describe('error', () => {
    it('Should log error message', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.error('VoIP', 'error');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.ERROR,
        'VoIP: error',
      );
    });
  });

  describe('fatal', () => {
    it('Should log fatal message', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.fatal('VoIP', 'fatal');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.FATAL,
        'VoIP: fatal',
      );
    });
  });

  describe('trace', () => {
    it('Should log trace message', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.trace('VoIP', 'trace');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.TRACE,
        'VoIP: trace',
      );
    });
  });
});
