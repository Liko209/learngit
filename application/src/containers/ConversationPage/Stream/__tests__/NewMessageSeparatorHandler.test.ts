import { getGlobalValue } from '../../../../store/utils';
import { FetchDataDirection, ISortableModel } from '../../../../store/base';
import { NewMessageSeparatorHandler } from '../NewMessageSeparatorHandler';
import { SeparatorType } from '../types';
import _ from 'lodash';

jest.mock('../../../../store/utils');

type OnAddedCaseConfig = {
  setup?: (handler: NewMessageSeparatorHandler) => void;
  readThrough?: number;
  postCreatorId?: number;
  currentUserId?: number;
  allPosts: ISortableModel[];
  direction?: FetchDataDirection;
};

type OnDeletedCaseConfig = {
  setup?: (handler: NewMessageSeparatorHandler) => void;
  postCreatorId?: number;
  currentUserId?: number;
  deletedPostIds: number[];
  allPosts: ISortableModel[];
};

function runOnAdded({
  postCreatorId = 1,
  currentUserId = 2,
  readThrough,
  allPosts,
  setup,
  direction,
}: OnAddedCaseConfig) {
  (getGlobalValue as jest.Mock).mockReturnValueOnce(currentUserId);

  allPosts.forEach(
    item => (item.data = item.data || { creator_id: postCreatorId }),
  );

  const handler = new NewMessageSeparatorHandler();
  setup && setup(handler);
  readThrough && handler.setReadThroughIfNoSeparator(readThrough);
  handler.onAdded(
    direction || FetchDataDirection.UP,
    _(allPosts)
      .clone()
      .reverse(),
    allPosts,
  );
  return handler;
}

function runOnDeleted({
  postCreatorId = 1,
  currentUserId = 2,
  deletedPostIds,
  allPosts,
  setup,
}: OnDeletedCaseConfig) {
  (getGlobalValue as jest.Mock).mockReturnValueOnce(currentUserId);

  allPosts.forEach(
    item => (item.data = item.data || { creator_id: postCreatorId }),
  );

  const handler = new NewMessageSeparatorHandler();
  setup && setup(handler);
  handler.onDeleted(deletedPostIds, allPosts);
  return handler;
}

describe('NewMessageSeparatorHandler', () => {
  describe('onAdded()', () => {
    it('should have a separator aim to the readThrough post', () => {
      const handler = runOnAdded({
        readThrough: 620249092,
        allPosts: [
          { id: 620232708, sortValue: 1540461821422 },
          { id: 620240900, sortValue: 1540461830617 },
          { id: 620249092, sortValue: 1540461830964 }, // readThrough is here
          { id: 620257284, sortValue: 1540461970776 },
          { id: 620265476, sortValue: 1540461970958 },
          { id: 620273668, sortValue: 1540461971175 },
          { id: 620281860, sortValue: 1540461972285 },
        ],
      });

      expect(handler.separatorMap.size).toBe(1);
      expect(handler.separatorMap.get(620257284)).toHaveProperty(
        'type',
        SeparatorType.NEW_MSG,
      );
    });

    it('should not add separator when the post is send by current user', () => {
      const handler = runOnAdded({
        currentUserId: 1,
        postCreatorId: 1,
        readThrough: 620249092,
        allPosts: [
          { id: 620232708, sortValue: 1540461821422, data: { creator_id: 1 } },
          { id: 620240900, sortValue: 1540461830617, data: { creator_id: 1 } },
          { id: 620249092, sortValue: 1540461830964, data: { creator_id: 1 } }, // readThrough is here
          { id: 620257284, sortValue: 1540461970776, data: { creator_id: 1 } },
          { id: 620265476, sortValue: 1540461970958, data: { creator_id: 1 } },
          { id: 620273668, sortValue: 1540461971175, data: { creator_id: 1 } },
          { id: 620281860, sortValue: 1540461972285, data: { creator_id: 1 } },
        ],
      });

      expect(handler.separatorMap.size).toBe(0);
    });

    it('should have not separator when readThrough post is not existed', () => {
      const handler = runOnAdded({
        readThrough: 999,
        allPosts: [
          { id: 1000, sortValue: 1 },
          { id: 1001, sortValue: 2 },
          { id: 1002, sortValue: 3 },
        ],
      });

      expect(handler.separatorMap.size).toBe(0);
    });

    it('should have not separator when readThrough is empty', () => {
      const handler = runOnAdded({
        readThrough: undefined,
        allPosts: [
          { id: 1000, sortValue: 1 },
          { id: 1001, sortValue: 2 },
          { id: 1002, sortValue: 3 },
        ],
      });

      expect(handler.separatorMap.size).toBe(0);
    });

    it('should not change the existed separator when post added', () => {
      const handler = runOnAdded({
        setup(handler) {
          handler.separatorMap.set(1000, { type: SeparatorType.NEW_MSG });
        },
        readThrough: 1001,
        allPosts: [
          { id: 1000, sortValue: 1 },
          { id: 1001, sortValue: 2 },
          { id: 1002, sortValue: 3 },
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
          handler.setReadThroughIfNoSeparator(1001);
          handler.disable();
        },
        readThrough: 1001,
        direction: FetchDataDirection.DOWN,
        allPosts: [{ id: 1000, sortValue: 1 }],
      });

      expect(handler.separatorMap.size).toBe(0);
    });

    it('should work when it was enabled', () => {
      const handler = runOnAdded({
        setup(handler) {
          handler.disable();
          handler.enable();
        },
        direction: FetchDataDirection.DOWN,
        readThrough: 620249092,
        allPosts: [
          { id: 620232708, sortValue: 1540461821422 },
          { id: 620240900, sortValue: 1540461830617 },
          { id: 620249092, sortValue: 1540461830964 }, // readThrough is here
          { id: 620257284, sortValue: 1540461970776 },
          { id: 620265476, sortValue: 1540461970958 },
          { id: 620273668, sortValue: 1540461971175 },
          { id: 620281860, sortValue: 1540461972285 },
        ],
      });

      expect(handler.separatorMap.size).toBe(1);
      expect(handler.separatorMap.get(620257284)).toHaveProperty(
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

    it('should move the separator to next post', () => {
      const handler = runOnDeleted({
        setup(handler) {
          handler.separatorMap.set(1000, { type: SeparatorType.NEW_MSG });
        },
        deletedPostIds: [1000],
        allPosts: [
          { id: 999, sortValue: 1 },
          { id: 1001, sortValue: 3 },
          { id: 1002, sortValue: 4 },
        ],
      });

      expect(handler.separatorMap.size).toBe(1);
      expect(handler.separatorMap.get(1001)).toHaveProperty(
        'type',
        SeparatorType.NEW_MSG,
      );
    });

    it('should move the separator to next post that not sent by current user', () => {
      const handler = runOnDeleted({
        setup(handler) {
          handler.separatorMap.set(1000, { type: SeparatorType.NEW_MSG });
        },
        currentUserId: 1,
        deletedPostIds: [1000],
        allPosts: [
          { id: 999, sortValue: 1, data: { creator_id: 1 } },
          { id: 1001, sortValue: 3, data: { creator_id: 1 } },
          { id: 1002, sortValue: 4, data: { creator_id: 2 } },
        ],
      });
      expect(handler.separatorMap.size).toBe(1);
      expect(handler.separatorMap.get(1002)).toHaveProperty(
        'type',
        SeparatorType.NEW_MSG,
      );
    });

    it('should do nothing when deleted post has no separator', () => {
      const handler = runOnDeleted({
        setup(handler) {
          handler.separatorMap.set(1000, { type: SeparatorType.NEW_MSG });
        },
        deletedPostIds: [1001],
        allPosts: [
          { id: 999, sortValue: 1 },
          { id: 1000, sortValue: 3 },
          { id: 1002, sortValue: 4 },
        ],
      });
      expect(handler.separatorMap.size).toBe(1);
      expect(handler.separatorMap.get(1000)).toHaveProperty(
        'type',
        SeparatorType.NEW_MSG,
      );
    });
  });
});
