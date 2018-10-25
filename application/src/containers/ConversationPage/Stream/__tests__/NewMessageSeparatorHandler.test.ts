import { FetchDataDirection, ISortableModel } from '../../../../store/base';
import { NewMessageSeparatorHandler } from '../NewMessageSeparatorHandler';
import { SeparatorType } from '../types';

type OnAddedCaseConfig = {
  setup?: (handler: NewMessageSeparatorHandler) => void;
  readThrough?: number;
  addedItems: ISortableModel[];
  direction?: FetchDataDirection;
};

function runOnAdded({
  readThrough,
  addedItems,
  setup,
  direction,
}: OnAddedCaseConfig) {
  const handler = new NewMessageSeparatorHandler();
  setup && setup(handler);
  readThrough && handler.setReadThrough(readThrough);
  handler.onAdded(direction || FetchDataDirection.UP, addedItems, addedItems);
  return handler;
}

describe('NewMessageSeparatorHandler', () => {
  describe('onAdded()', () => {
    it('should have a separator aim to the readThrough post', () => {
      const handler = runOnAdded({
        readThrough: 620249092,
        addedItems: [
          { id: 620281860, sortValue: 1540461972285 },
          { id: 620273668, sortValue: 1540461971175 },
          { id: 620265476, sortValue: 1540461970958 },
          { id: 620257284, sortValue: 1540461970776 },
          { id: 620249092, sortValue: 1540461830964 }, // readThrough is here
          { id: 620240900, sortValue: 1540461830617 },
          { id: 620232708, sortValue: 1540461821422 },
        ],
      });

      expect(handler.separatorMap.size).toBe(1);
      expect(handler.separatorMap.get(620257284)).toHaveProperty(
        'type',
        SeparatorType.NEW_MSG,
      );
    });

    it('should have not separator when readThrough is empty', () => {
      const handler = runOnAdded({
        readThrough: undefined,
        addedItems: [
          { id: 1002, sortValue: 3 },
          { id: 1001, sortValue: 2 },
          { id: 1000, sortValue: 1 },
        ],
      });

      expect(handler.separatorMap.size).toBe(0);
    });

    it('should not change the separator when post added', () => {
      const handler = runOnAdded({
        setup(handler) {
          handler.separatorMap.set(1000, { type: SeparatorType.NEW_MSG });
        },
        readThrough: 1001,
        addedItems: [
          { id: 1002, sortValue: 3 },
          { id: 1001, sortValue: 2 },
          { id: 1000, sortValue: 1 },
        ],
      });

      // The separator should still be there
      expect(handler.separatorMap.size).toBe(1);
      expect(handler.separatorMap.get(1000)).toHaveProperty(
        'type',
        SeparatorType.NEW_MSG,
      );
    });

    it('should do nothing when it was disabled', () => {
      const handler = runOnAdded({
        setup(handler) {
          handler.setReadThrough(1001);
          handler.disable();
        },
        readThrough: 1001,
        direction: FetchDataDirection.DOWN,
        addedItems: [{ id: 1000, sortValue: 1 }],
      });

      expect(handler.separatorMap.size).toBe(0);
    });

    it('should work when it was enabled', () => {
      const handler = runOnAdded({
        setup(handler) {
          handler.disable();
          handler.enable();
        },
        readThrough: 1000,
        direction: FetchDataDirection.DOWN,
        addedItems: [{ id: 1000, sortValue: 1 }, { id: 1001, sortValue: 1 }],
      });

      expect(handler.separatorMap.size).toBe(1);
      expect(handler.separatorMap.get(1001)).toHaveProperty(
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
          { id: 1002, sortValue: 4 },
          { id: 1001, sortValue: 3 },
          { id: 999, sortValue: 1 },
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
