import { ENTITY } from 'sdk/service';
import {
  FetchSortableDataListHandler,
  IFetchSortableDataProvider,
} from '@/store/base/fetch/FetchSortableDataListHandler';
import { ISeparatorHandler } from '../ISeparatorHandler';
import { PostTransformHandler } from '../PostTransformHandler';
import {
  SeparatorType,
  StreamItemType,
  NewSeparator,
  DateSeparator,
  Separator,
} from '../types';
import { ENTITY_NAME } from '@/store';
import { Post } from 'sdk/module/post/entity';

const isMatchFunc = (groupId: number) => (dataModel: Post) =>
  dataModel.group_id === Number(groupId);

const transformFunc = (dataModel: Post) => ({
  id: dataModel.id,
  sortValue: dataModel.created_at,
  data: dataModel,
});

function setup({ groupId }: { groupId: number }) {
  const dataProvider: IFetchSortableDataProvider<Post> = {
    async fetchData() {
      return {
        data: [],
        hasMore: true,
      };
    },
  };

  const orderListHandler = new FetchSortableDataListHandler(dataProvider, {
    transformFunc,
    hasMoreUp: false,
    hasMoreDown: false,
    isMatchFunc: isMatchFunc(groupId),
    entityName: ENTITY_NAME.POST,
    eventName: ENTITY.POST,
    dataChangeCallBack: () => {},
  });

  const transformHandler = new PostTransformHandler({
    handler: orderListHandler,
    separatorHandlers: [],
  });

  return { transformHandler };
}

class FakeSeparatorHandler implements ISeparatorHandler {
  priority: number = 1;
  separatorMap: Map<number, Separator> = new Map();
  onAdded(): void {}
  onDeleted(): void {}
}

describe('PostTransformHandler', () => {
  describe('upsert()', () => {
    it('should append posts', () => {
      const { transformHandler } = setup({
        groupId: 1,
      });

      transformHandler.upsert([
        { id: 10, created_at: 10, group_id: 1 },
        { id: 11, created_at: 11, group_id: 1 },
        { id: 21, created_at: 21, group_id: 2 },
        { id: 22, created_at: 22, group_id: 2 },
      ] as Post[]);

      expect(transformHandler.postIds).toEqual([10, 11]);
      expect(transformHandler.items).toEqual([
        { type: StreamItemType.POST, value: 10 },
        { type: StreamItemType.POST, value: 11 },
      ]);
    });
  });

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

    it('should ignore first item if it was separator', () => {
      const postIds = [1000, 1001];
      const separatorMap = new Map<number, NewSeparator | DateSeparator>([
        [1000, { type: SeparatorType.DATE, timestamp: 1540444305054 }],
      ]);

      const streamItems = PostTransformHandler.toStreamItems(
        postIds,
        separatorMap,
      );

      expect(streamItems).toEqual([
        { type: StreamItemType.POST, value: 1000 },
        { type: StreamItemType.POST, value: 1001 },
      ]);
    });
  });

  describe('#combineSeparatorHandlersMaps()', () => {
    it('should combine separatorHandlers separatorMap', () => {
      const handler1 = new FakeSeparatorHandler();
      const handler2 = new FakeSeparatorHandler();
      handler1.separatorMap.set(1000, { type: SeparatorType.DATE });
      handler2.separatorMap.set(1001, { type: SeparatorType.NEW_MSG });
      const separatorMap = PostTransformHandler.combineSeparatorHandlersMaps([
        handler1,
        handler2,
      ]);
      expect(separatorMap.get(1000)).toEqual({ type: SeparatorType.DATE });
      expect(separatorMap.get(1001)).toEqual({ type: SeparatorType.NEW_MSG });
    });

    it('should handle priority', () => {
      const handler1 = new FakeSeparatorHandler();
      const handler2 = new FakeSeparatorHandler();
      handler1.separatorMap.set(1000, { type: SeparatorType.DATE });
      handler2.separatorMap.set(1000, { type: SeparatorType.NEW_MSG });

      // NEW_MSG has higher priority
      handler1.priority = 1;
      handler2.priority = 2;
      const separatorMap = PostTransformHandler.combineSeparatorHandlersMaps([
        handler1,
        handler2,
      ]);
      expect(separatorMap.get(1000)).toEqual({ type: SeparatorType.NEW_MSG });

      // DATE has higher priority
      handler1.priority = 2;
      handler2.priority = 1;
      const separatorMap2 = PostTransformHandler.combineSeparatorHandlersMaps([
        handler1,
        handler2,
      ]);
      expect(separatorMap2.get(1000)).toEqual({ type: SeparatorType.DATE });
    });
  });
});
