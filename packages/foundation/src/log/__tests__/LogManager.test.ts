import LogManager from '../LogManager';
import { configManager } from '../config';
import { logConfigFactory } from './factory';

describe('LogManager', () => {
  configManager.setConfig(logConfigFactory.build());
  const logManager = LogManager.getInstance();
  describe('getLogger()', () => {
    it('should get log single instance', () => {
      const loggers = [
        logManager.getMainLogger(),
        logManager.getMainLogger(),
        logManager.getNetworkLogger(),
        logManager.getNetworkLogger(),
      ];
      expect(loggers[0]).toEqual(loggers[1]);
      expect(loggers[2]).toEqual(loggers[3]);
    });
  });
});
