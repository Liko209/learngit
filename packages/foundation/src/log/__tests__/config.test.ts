import { ILogLoader, LogEntity } from '../types';
import { logConfigFactory, consumerConfigFactory } from './factory';
import { configManager } from '../config';
import { LOG_LEVEL } from '../constants';
class DummyLoader implements ILogLoader {
  options: object;

  handle(data: LogEntity): LogEntity {
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
      const consumerConfig = consumerConfigFactory.build({
        enabled: false,
      });
      const result = configManager.mergeConfig({
        consumer: consumerConfig,
      });
      expect(result).toEqual({ ...rawConfig, consumer: consumerConfig });
    });

    it('should replace array value in config', async () => {
      const expectLoaders = [
        new DummyLoader(),
        new DummyLoader(),
      ];
      const rawConfig = configManager.getConfig();
      const result = configManager.mergeConfig({
        loaders: expectLoaders,
      });
      expect(result).toEqual({ ...rawConfig, loaders: expectLoaders });
    });
  });
});
