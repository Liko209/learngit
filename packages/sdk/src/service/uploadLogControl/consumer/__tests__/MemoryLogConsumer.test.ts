/*
 * @Author: Paynter Chen
 * @Date: 2019-03-25 14:19:08
 * Copyright © RingCentral. All rights reserved.
 */
import { MemoryConsumer } from '../MemoryLogConsumer';
import { logEntityFactory } from 'foundation/src/log/__tests__/factory';

describe('MemoryConsumer', () => {
  describe('onLog()', () => {
    it('should add log to memory queue', () => {
      const memoryConsumer = new MemoryConsumer();
      memoryConsumer.onLog(logEntityFactory.build({ size: 10 }));
      expect(memoryConsumer['_recentLogQueue'].length).toEqual(1);
      expect(memoryConsumer['_totalSize']).toEqual(10);
      memoryConsumer.onLog(logEntityFactory.build({ size: 10 }));
      expect(memoryConsumer['_recentLogQueue'].length).toEqual(2);
      expect(memoryConsumer['_totalSize']).toEqual(20);
    });
    it('should remove old log when reach threshold', () => {
      const memoryConsumer = new MemoryConsumer();
      /**
       * threshold: 20
       * format:
       * + input = result
       * init = []
       * + 10 = [10]
       * + 11 = [11] (remove first 10)
       */
      memoryConsumer.setSizeThreshold(20);
      memoryConsumer.onLog(logEntityFactory.build({ size: 10 }));
      memoryConsumer.onLog(logEntityFactory.build({ size: 11 }));
      expect(memoryConsumer['_recentLogQueue'].length).toEqual(1);
      expect(memoryConsumer['_totalSize']).toEqual(11);
    });
    it('should remove old log when reach threshold', () => {
      const memoryConsumer = new MemoryConsumer();
      /**
       * threshold: 20
       * format:
       * + input = result
       * init = []
       * + 10 = [10]
       * + 10 = [10, 10]
       * + 10 = [10, 10] (remove first 10)
       */
      memoryConsumer.setSizeThreshold(20);
      memoryConsumer.onLog(logEntityFactory.build({ size: 10 }));
      memoryConsumer.onLog(logEntityFactory.build({ size: 10 }));
      memoryConsumer.onLog(logEntityFactory.build({ size: 10 }));
      expect(memoryConsumer['_recentLogQueue'].length).toEqual(2);
      expect(memoryConsumer['_totalSize']).toEqual(20);
    });
    it('should remove old log when reach threshold', () => {
      const memoryConsumer = new MemoryConsumer();
      /**
       * threshold: 20
       * format:
       * + input = result
       * init = []
       * + 10 = [10]
       * + 10 = [10, 10]
       * + 40 = [40] (remove [10, 10])
       * + 1 = [1] (remove 40)
       */
      memoryConsumer.setSizeThreshold(20);
      memoryConsumer.onLog(logEntityFactory.build({ size: 10 }));
      memoryConsumer.onLog(logEntityFactory.build({ size: 10 }));
      memoryConsumer.onLog(logEntityFactory.build({ size: 40 }));
      expect(memoryConsumer['_recentLogQueue'].length).toEqual(1);
      expect(memoryConsumer['_totalSize']).toEqual(40);
      memoryConsumer.onLog(logEntityFactory.build({ size: 1 }));
      expect(memoryConsumer['_recentLogQueue'].length).toEqual(1);
      expect(memoryConsumer['_totalSize']).toEqual(1);
    });
  });
});
