import { LogEntityProcessor } from '../LogEntityProcessor';
import { ILogEntityDecorator, LogEntity } from '../types';
import { logEntityFactory, logConfigFactory } from './factory';
import { configManager } from '../config';
class DummyLoader implements ILogEntityDecorator {
  options: object;

  decorate(data: LogEntity): LogEntity {
    return data;
  }

}

describe('LogEntityProcessor', () => {

  describe('process()', () => {
    it('should call loader by sequence', async () => {

      const decorators = [
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
        decorators,
      }));
      jest.spyOn(decorators[0], 'decorate').mockReturnValue(logs[1]);
      jest.spyOn(decorators[1], 'decorate').mockReturnValue(logs[2]);

      const processor = new LogEntityProcessor();
      const result = processor.process(logs[0]);
      expect(decorators[0].decorate).toBeCalledWith(logs[0]);
      expect(decorators[1].decorate).toBeCalledWith(logs[1]);
      expect(result).toEqual(logs[2]);
    });
  });
});
