/*
 * @Author: Paynter Chen
 * @Date: 2019-03-25 14:19:08
 * Copyright © RingCentral. All rights reserved.
 */
import { FixSizeMemoryLogCollection } from '../FixSizeMemoryLogCollection';
import { logEntityFactory } from 'foundation/src/log/__tests__/factory';

describe('FixSizeMemoryLogCollection', () => {
  describe('push()', () => {
    it('should add log to memory queue', () => {
      const collection = new FixSizeMemoryLogCollection();
      collection.push(logEntityFactory.build({ size: 10 }));
      expect(collection['_recentLogQueue'].length).toEqual(1);
      expect(collection.size()).toEqual(10);
      collection.push(logEntityFactory.build({ size: 10 }));
      expect(collection['_recentLogQueue'].length).toEqual(2);
      expect(collection.size()).toEqual(20);
    });
    it('should remove old log when reach threshold', () => {
      const collection = new FixSizeMemoryLogCollection();
      /**
       * threshold: 20
       * format:
       * + input = result
       * init = []
       * + 10 = [10]
       * + 11 = [11] (remove first 10)
       */
      collection.setSizeThreshold(20);
      collection.push(logEntityFactory.build({ size: 10 }));
      collection.push(logEntityFactory.build({ size: 11 }));
      expect(collection['_recentLogQueue'].length).toEqual(1);
      expect(collection.size()).toEqual(11);
    });
    it('should remove old log when reach threshold', () => {
      const collection = new FixSizeMemoryLogCollection();
      /**
       * threshold: 20
       * format:
       * + input = result
       * init = []
       * + 10 = [10]
       * + 10 = [10, 10]
       * + 10 = [10, 10] (remove first 10)
       */
      collection.setSizeThreshold(20);
      collection.push(logEntityFactory.build({ size: 10 }));
      collection.push(logEntityFactory.build({ size: 10 }));
      collection.push(logEntityFactory.build({ size: 10 }));
      expect(collection['_recentLogQueue'].length).toEqual(2);
      expect(collection.size()).toEqual(20);
    });
    it('should remove old log when reach threshold', () => {
      const collection = new FixSizeMemoryLogCollection();
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
      collection.setSizeThreshold(20);
      collection.push(logEntityFactory.build({ size: 10 }));
      collection.push(logEntityFactory.build({ size: 10 }));
      collection.push(logEntityFactory.build({ size: 40 }));
      expect(collection['_recentLogQueue'].length).toEqual(1);
      expect(collection.size()).toEqual(40);
      collection.push(logEntityFactory.build({ size: 1 }));
      expect(collection['_recentLogQueue'].length).toEqual(1);
      expect(collection.size()).toEqual(1);
    });
  });
  describe('get()', () => {
    it('should add log to memory queue', () => {
      const collection = new FixSizeMemoryLogCollection();
      const mockData = logEntityFactory.buildList(10, { size: 0 });
      mockData.forEach(item => {
        collection.push(item);
      });
      expect(collection.get()).toEqual(mockData);
    });
  });
});
