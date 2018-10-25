import { FetchDataDirection } from '../../../../store/base';
import { NewMessageSeparatorHandler } from '../NewMessageSeparatorHandler';
import { SeparatorType } from '../types';

describe('NewMessageSeparatorHandler', () => {
  describe('onAdded()', () => {
    it('should have a separator aim to the readThrough post', () => {
      const handler = new NewMessageSeparatorHandler();
      handler.setReadThrough(1001);

      handler.onAdded(
        FetchDataDirection.UP,
        [{ id: 1000, sortValue: 1 }, { id: 1001, sortValue: 2 }],
        [{ id: 1000, sortValue: 1 }, { id: 1001, sortValue: 2 }],
      );

      expect(handler.separatorMap.size).toBe(1);
      expect(handler.separatorMap.get(1001)).toHaveProperty(
        'type',
        SeparatorType.NEW_MSG,
      );
    });

    it('should have not separator when readThrough is empty', () => {
      const handler = new NewMessageSeparatorHandler();

      handler.onAdded(
        FetchDataDirection.UP,
        [{ id: 1000, sortValue: 1 }, { id: 1001, sortValue: 2 }],
        [{ id: 1000, sortValue: 1 }, { id: 1001, sortValue: 2 }],
      );

      expect(handler.separatorMap.size).toBe(0);
    });

    it('should not change the separator when post added', () => {
      const handler = new NewMessageSeparatorHandler();
      handler.setReadThrough(1001);
      // Set a existed separator
      handler.separatorMap.set(1000, { type: SeparatorType.NEW_MSG });

      handler.onAdded(
        FetchDataDirection.UP,
        [{ id: 1000, sortValue: 1 }, { id: 1001, sortValue: 2 }],
        [{ id: 1000, sortValue: 1 }, { id: 1001, sortValue: 2 }],
      );

      // The separator should still be there
      expect(handler.separatorMap.size).toBe(1);
      expect(handler.separatorMap.get(1000)).toHaveProperty(
        'type',
        SeparatorType.NEW_MSG,
      );
    });

    it('should do nothing when it was disabled', () => {
      const handler = new NewMessageSeparatorHandler();
      handler.setReadThrough(1001);
      handler.disable();

      handler.onAdded(
        FetchDataDirection.DOWN,
        [{ id: 1000, sortValue: 1 }],
        [{ id: 1000, sortValue: 1 }],
      );

      expect(handler.separatorMap.size).toBe(0);
    });

    it('should work when it was enabled', () => {
      const handler = new NewMessageSeparatorHandler();
      handler.setReadThrough(1000);
      handler.disable();
      handler.enable();

      handler.onAdded(
        FetchDataDirection.DOWN,
        [{ id: 1000, sortValue: 1 }],
        [{ id: 1000, sortValue: 2 }],
      );

      expect(handler.separatorMap.size).toBe(1);
      expect(handler.separatorMap.get(1000)).toHaveProperty(
        'type',
        SeparatorType.NEW_MSG,
      );
    });
  });

  describe('onDeleted()', () => {
    it('should delete the separator', () => {
      const handler = new NewMessageSeparatorHandler();
      handler.separatorMap.set(1000, { type: SeparatorType.NEW_MSG });

      handler.onDeleted([1000], []);
      expect(handler.separatorMap.size).toBe(0);
    });

    it('should move the separator to next postId', () => {
      const handler = new NewMessageSeparatorHandler();
      handler.separatorMap.set(1000, { type: SeparatorType.NEW_MSG });

      // Delete post 1000
      handler.onDeleted(
        [1000],
        [
          { id: 999, sortValue: 1 },
          { id: 1001, sortValue: 3 },
          { id: 1002, sortValue: 4 },
        ],
      );

      expect(handler.separatorMap.size).toBe(1);
      expect(handler.separatorMap.get(1001)).toHaveProperty(
        'type',
        SeparatorType.NEW_MSG,
      );
    });
  });
});
