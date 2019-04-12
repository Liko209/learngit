import { ILogEntityDecorator, LogEntity } from '../types';
import { logConfigFactory } from './factory';
import { configManager } from '../config';
import { LOG_LEVEL } from '../constants';
class DummyLoader implements ILogEntityDecorator {
  options: object;

  decorate(data: LogEntity): LogEntity {
    return data;
  }
}

describe('config', () => {
  describe('mergeConfig()', () => {
    beforeEach(() => {
      configManager.setConfig(logConfigFactory.build());
    });
    it('should replace base type value in config', async () => {
      const rawConfig = configManager.getConfig();
      const result = configManager.mergeConfig({
        level: LOG_LEVEL.ERROR,
      });
      expect(result).toEqual({ ...rawConfig, level: LOG_LEVEL.ERROR });
    });

    it('should merge object type in config', async () => {
      const rawConfig = configManager.getConfig();
      const result = configManager.mergeConfig({
        collector: {
          enabled: false,
        },
      });
      expect(result).toEqual({ ...rawConfig, consumer: { enabled: false } });
    });

    it('should replace array value in config', async () => {
      const expectDecorators = [new DummyLoader(), new DummyLoader()];
      const rawConfig = configManager.getConfig();
      const result = configManager.mergeConfig({
        decorators: expectDecorators,
      });
      expect(result).toEqual({ ...rawConfig, decorators: expectDecorators });
    });
  });
});
