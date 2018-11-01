import { PostTransformHandler } from '../PostTransformHandler';
import {
  SeparatorType,
  StreamItemType,
  NewSeparator,
  DateSeparator,
} from '../types';

describe('PostTransformHandler', () => {
  describe('#toStreamItems()', () => {
    it('should transform postIds+separatorMap into streamItems', () => {
      const postIds = [1000, 1001, 1002, 1003];
      const separatorMap = new Map<number, NewSeparator | DateSeparator>([
        [1001, { type: SeparatorType.DATE, timestamp: 1540444305054 }],
        [1003, { type: SeparatorType.NEW_MSG }],
      ]);

      const streamItems = PostTransformHandler.toStreamItems(
        postIds,
        separatorMap,
      );

      expect(streamItems).toEqual([
        { type: StreamItemType.POST, value: 1000 },
        { type: StreamItemType.DATE_SEPARATOR, value: 1540444305054 },
        { type: StreamItemType.POST, value: 1001 },
        { type: StreamItemType.POST, value: 1002 },
        { type: StreamItemType.NEW_MSG_SEPARATOR, value: null },
        { type: StreamItemType.POST, value: 1003 },
      ]);
    });
  });
});
