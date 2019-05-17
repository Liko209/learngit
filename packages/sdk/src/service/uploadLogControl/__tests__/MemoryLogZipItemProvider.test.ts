/*
 * @Author: Paynter Chen
 * @Date: 2019-05-06 08:56:20
 * Copyright © RingCentral. All rights reserved.
 */
import { MemoryLogZipItemProvider } from '../MemoryLogZipItemProvider';
import { MemoryCollector } from '../collectors/memoryCollector';

describe('MemoryLogZipItemProvider', () => {
  describe('getZipItems()', () => {
    it('should getZipItems from memoryCollector', async () => {
      const mockMemoryLogCollector: MemoryCollector = {
        onLog: () => {},
        getAll: () => [{ message: 'test' }],
      };
      const provider = new MemoryLogZipItemProvider(mockMemoryLogCollector);
      const result = await provider.getZipItems();
      expect(result.length).toEqual(1);
      expect(result[0].type).toEqual('.txt');
      expect(result[0].name).toEqual('RecentLogs');
    });
  });
});
