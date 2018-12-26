import { LogEntityProcessor } from '../LogEntityProcessor';
import { ILogLoader, LogEntity } from '../types';
import { logEntityFactory, logConfigFactory } from './factory';
import { configManager } from '../config';
class DummyLoader implements ILogLoader {
  options: object;

  handle(data: LogEntity): LogEntity {
    return data;
  }

}

describe('LogEntityProcessor', () => {

  describe('process()', () => {
    it('should call loader by sequence', async () => {

      const loaders = [
        new DummyLoader(),
        new DummyLoader(),
      ];
      const logs = [
        logEntityFactory.build({
          sessionIndex: 1,
        }),
        logEntityFactory.build({
          sessionIndex: 2,
        }),
        logEntityFactory.build({
          sessionIndex: 3,
        }),
      ];
      configManager.setConfig(logConfigFactory.build({
        loaders,
      }));
      jest.spyOn(loaders[0], 'handle').mockReturnValue(logs[1]);
      jest.spyOn(loaders[1], 'handle').mockReturnValue(logs[2]);

      const processor = new LogEntityProcessor();
      const result = processor.process(logs[0]);
      expect(loaders[0].handle).toBeCalledWith(logs[0]);
      expect(loaders[1].handle).toBeCalledWith(logs[1]);
      expect(result).toEqual(logs[2]);
    });
  });
});
