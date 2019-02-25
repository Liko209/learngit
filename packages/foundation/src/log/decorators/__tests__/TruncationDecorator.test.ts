import { TruncationDecorator } from '../TruncationDecorator';
import { logEntityFactory } from '../../__tests__/factory';
describe('TruncationDecorator', () => {
  describe('decorate', () => {
    it('should cut by limiting length', async () => {
      const mockLog = logEntityFactory.build();
      const loader = new TruncationDecorator();
      loader.options = {
        limit: 2,
      };
      mockLog.params = ['1', '22', '333', '4444'];
      expect(loader.decorate(mockLog)['params']).toEqual([
        '1',
        '22',
        JSON.stringify({ truncation: '33' }),
        JSON.stringify({ truncation: '44' }),
      ]);
    });
    it('should ignore object', async () => {
      const mockLog = logEntityFactory.build();
      const loader = new TruncationDecorator();
      const object = {
        x: 'sss',
      };
      loader.options = {
        limit: 2,
      };
      mockLog.params = ['22', object, '333'];
      expect(loader.decorate(mockLog)['params']).toEqual([
        '22',
        object,
        JSON.stringify({ truncation: '33' }),
      ]);
    });
    it('should not work when no options', async () => {
      const mockLog = logEntityFactory.build();
      const loader = new TruncationDecorator();
      const object = {
        x: 'sss',
      };
      mockLog.params = ['22', object, '333'];
      expect(loader.decorate(mockLog)['params']).toEqual(['22', object, '333']);
    });
    it('should not work when params is empty', async () => {
      const mockLog = logEntityFactory.build();
      const loader = new TruncationDecorator();
      mockLog.params = [];
      expect(loader.decorate(mockLog)['params']).toEqual([]);
    });
  });
});
