import { LogEntity } from '../types';
import { ConsoleLogPrettier } from '../ConsoleLogPrettier';

describe('ConsoleLogPrettier', () => {

  describe('prettier()', () => {
    it('should prettier tags', async () => {
      const prettier = new ConsoleLogPrettier();
      const log = new LogEntity();
      log.tags = ['tag1', 'tag2'];
      log.params = ['p1', 'p2'];
      const spy = jest.spyOn(prettier, 'addColor');
      prettier.prettier(log);
      expect(spy).toBeCalledWith(log.tags);
    });
  });
});
