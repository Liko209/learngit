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
    it('Should print empty when not insert logger [JPT-553]', async () => {
      const loggerImpl = new LoggerImpl();
      rtcLogger.info('VoIP', 'empty');
      expect(loggerImpl.doLog.mock.calls.length).toBe(0);
    });
  });

  describe('info', () => {
    it('Should print info log message insert logger [JPT-554]', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.info('VoIP', 'info');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.INFO,
        'VoIP: info',
      );
    });
  });

  describe('warn', () => {
    it('Should print warn log message when insert logger [JPT-555]', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.warn('VoIP', 'warn');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.WARN,
        'VoIP: warn',
      );
    });
  });

  describe('debug', () => {
    it('Should print debug log message when insert logger [JPT-556]', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.debug('VoIP', 'debug');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.DEBUG,
        'VoIP: debug',
      );
    });
  });

  describe('error', () => {
    it('Should print error log message when insert logger [JPT-559]', async () => {
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
    it('Should print fatal log message when insert logger [JPT-558]', async () => {
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
    it('Should print trace log message when insert logger [JPT-557]', async () => {
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
