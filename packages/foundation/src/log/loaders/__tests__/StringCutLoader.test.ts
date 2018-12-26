import { StringCutLoader } from '../StringCutLoader';
import { logEntityFactory } from '../../__tests__/factory';
describe('StringCutLoader', () => {

  describe('handle', () => {
    it('should cut correctly', async () => {
      const mockLog = logEntityFactory.build();
      const loader = new StringCutLoader();
      loader.options = {
        limit: 2,
      };
      mockLog.params = ['1', '22', '333', '4444'];
      expect(loader.handle(mockLog)['params']).toEqual(['1', '22', '33', '44']);
    });
    it('should ignore object', async () => {
      const mockLog = logEntityFactory.build();
      const loader = new StringCutLoader();
      const object = {
        x: 'sss',
      };
      loader.options = {
        limit: 2,
      };
      mockLog.params = ['22', object, '333'];
      expect(loader.handle(mockLog)['params']).toEqual(['22', object, '33']);
    });
  });
});
