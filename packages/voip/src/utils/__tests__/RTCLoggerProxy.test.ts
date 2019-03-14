/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-18 14:57:49
 * Copyright © RingCentral. All rights reserved.
 */

import { rtcLogger } from '../RTCLoggerProxy';
import { RTCEngine } from '../../api/RTCEngine';
import { LOG_LEVEL, IRTCLogger } from '../IRTCLogger';

class LoggerImpl implements IRTCLogger {
  doLog = jest.fn();
}

describe('LoggerProxy', () => {
  const voipTag: string = 'VoIP';
  const formatVoipTag: string = 'VoIP:';

  describe('info', () => {
    it('Should print empty when not insert logger [JPT-553]', async () => {
      const loggerImpl = new LoggerImpl();
      rtcLogger.info(voipTag, 'empty');
      expect(loggerImpl.doLog.mock.calls.length).toBe(0);
    });
  });

  describe('info', () => {
    it('Should print info log message insert logger [JPT-554]', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.info(voipTag, 'info');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.INFO,
        `${formatVoipTag} info`,
      );
    });
  });

  describe('warn', () => {
    it('Should print warn log message when insert logger [JPT-555]', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.warn(voipTag, 'warn');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.WARN,
        `${formatVoipTag} warn`,
      );
    });
  });

  describe('debug', () => {
    it('Should print debug log message when insert logger [JPT-556]', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.debug(voipTag, 'debug');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.DEBUG,
        `${formatVoipTag} debug`,
      );
    });
  });

  describe('error', () => {
    it('Should print error log message when insert logger [JPT-559]', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.error(voipTag, 'error');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.ERROR,
        `${formatVoipTag} error`,
      );
    });
  });

  describe('fatal', () => {
    it('Should print fatal log message when insert logger [JPT-558]', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.fatal(voipTag, 'fatal');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.FATAL,
        `${formatVoipTag} fatal`,
      );
    });
  });

  describe('trace', () => {
    it('Should print trace log message when insert logger [JPT-557]', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.trace(voipTag, 'trace');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.TRACE,
        `${formatVoipTag} trace`,
      );
    });
  });

  describe('loggerConnector', () => {
    const category: string = 'sip-ua';
    const label: string = 'undefined';
    const formatSipTag: string = `VoIP-Sip: ${category} [${label}]:`;
    it('Should print debug log message when get debug level [JPT-571]', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.loggerConnector('debug', category, label, 'debug');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.DEBUG,
        `${formatSipTag} debug`,
      );
    });

    it('Should print info log message when get log level [JPT-570]', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.loggerConnector('log', category, label, 'info');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.INFO,
        `${formatSipTag} info`,
      );
    });

    it('Should print warn log message when get warn level [JPT-569]', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.loggerConnector('warn', category, label, 'warn');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.WARN,
        `${formatSipTag} warn`,
      );
    });

    it('Should print error log message when get error level [JPT-572]', async () => {
      const loggerImpl = new LoggerImpl();
      RTCEngine.setLogger(loggerImpl);
      rtcLogger.loggerConnector('error', category, label, 'error');
      expect(loggerImpl.doLog).toHaveBeenCalledWith(
        LOG_LEVEL.ERROR,
        `${formatSipTag} error`,
      );
    });
  });
});
