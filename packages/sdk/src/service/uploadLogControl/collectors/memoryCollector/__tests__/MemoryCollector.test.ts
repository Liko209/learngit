import { MemoryCollector } from '../MemoryCollector';
import { logEntityFactory } from 'foundation/src/log/__tests__/factory';

describe('MemoryCollector', () => {
  describe('onLog()', () => {
    it('should collect log', () => {
      const collector = new MemoryCollector();
      const mockData = logEntityFactory.build({ size: 0 });
      collector.onLog(mockData);
      expect(collector.getAll()).toEqual(mockData);
    });
  });
});
