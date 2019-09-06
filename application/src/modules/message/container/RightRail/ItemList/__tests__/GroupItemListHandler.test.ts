/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-25 13:53:31
 * Copyright © RingCentral. All rights reserved.
 */
import { flushPromises } from 'shield/utils/flushPromises';
import notificationCenter from 'sdk/service/notificationCenter';
import { ItemNotification } from 'sdk/module/item';
import { ItemService } from 'sdk/module/item/service';
import { EVENT_TYPES } from 'sdk/service';
import { Item } from 'sdk/module/item/entity';
import { GlipTypeUtil } from 'sdk/utils/glip-type-dictionary';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { QUERY_DIRECTION } from 'sdk/dao';
import { DEFAULT_PAGE_SIZE } from '@/store/base/fetch/constant';
import { GroupItemListHandler } from '../GroupItemListHandler';
import { RIGHT_RAIL_ITEM_TYPE } from '../constants';
import { getTypeId } from '../utils';
jest.mock('sdk/module/item/service')

const itemService = ServiceLoader.getInstance<ItemService>(
  ServiceConfig.ITEM_SERVICE,
);

function setup({
  groupId,
  type,
  items,
}: {
  groupId: number;
  type: RIGHT_RAIL_ITEM_TYPE;
  items: any[];
}) {
  jest.spyOn(itemService, 'getGroupItemsCount').mockResolvedValue(100);
  const listHandler = new GroupItemListHandler(groupId, type);
  listHandler.upsert(items);
  return { listHandler };
}

function triggerReceiveItem(groupId: number, item: any) {
  notificationCenter.emit(
    ItemNotification.getItemNotificationKey(
      GlipTypeUtil.extractTypeId(item.id),
      groupId,
    ),
    {
      type: EVENT_TYPES.UPDATE,
      body: {
        ids: [item.id],
        entities: new Map<number, Item>([[item.id, item]]),
      },
    },
  );
}

function buildTaskItem(id: number, groupId: number = 1) {
  return {
    id,
    type_id: GlipTypeUtil.extractTypeId(id),
    group_ids: [groupId],
    post_ids: [10],
    complete: false,
    created_at: 100,
  };
}
function buildFileItem(id: number, groupId: number = 1) {
  return {
    id,
    type: 'txt',
    type_id: GlipTypeUtil.extractTypeId(id),
    group_ids: [groupId],
    post_ids: [10],
    created_at: 100,
  };
}

function triggerDeleteItem(groupId: number, item: any) {
  notificationCenter.emit(
    ItemNotification.getItemNotificationKey(
      GlipTypeUtil.extractTypeId(item.id),
      groupId,
    ),
    {
      type: EVENT_TYPES.DELETE,
      body: {
        ids: [item.id],
      },
    },
  );
}

describe('GroupItemListHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('total', () => {
    it('should be Infinity by default then fetch total', async () => {
      jest.spyOn(itemService, 'getGroupItemsCount').mockResolvedValue(100);

      const { listHandler } = setup({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
        items: [],
      });
      expect(listHandler.total).toBe(Infinity);
      await flushPromises();

      expect(listHandler.total).toBe(100);
    });

    it('should fetch total when list changed [JPT-983, JPT-984]', async () => {
      const groupId = 1;

      jest.spyOn(itemService, 'getGroupItemsCount').mockResolvedValue(100);
      const { listHandler } = setup({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
        items: [],
      });
      expect(listHandler.total).toBe(Infinity);
      await flushPromises();

      expect(listHandler.total).toBe(100);

      jest.spyOn(itemService, 'getGroupItemsCount').mockResolvedValue(101);
      triggerReceiveItem(groupId, buildTaskItem(2147475465));
      await flushPromises();

      expect(listHandler.total).toBe(101);
    });
  });

  describe('fetchData()', () => {
    function setupTaskListHandler({
      fetchedData = [],
    }: { fetchedData?: any[] } = {}) {
      const groupId = 1;
      const { listHandler } = setup({
        groupId,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
        items: [
          buildTaskItem(16393, groupId),
          buildTaskItem(675938313, groupId),
          buildTaskItem(736043017, groupId),
        ],
      });
      const mockedFetchDataInternal = jest
        .spyOn<any, any>(listHandler, 'fetchDataInternal')
        .mockResolvedValue(fetchedData);
      return { listHandler, mockedFetchDataInternal };
    }

    function setupFileListHandler({
      fetchedData = [],
    }: { fetchedData?: any[] } = {}) {
      const groupId = 1;
      const { listHandler } = setup({
        groupId,
        type: RIGHT_RAIL_ITEM_TYPE.NOT_IMAGE_FILES,
        items: [
          buildFileItem(1130815498, groupId),
          buildFileItem(1705000970, groupId),
          buildFileItem(1879384074, groupId),
        ],
      });
      const mockedFetchDataInternal = jest
        .spyOn<any, any>(listHandler, 'fetchDataInternal')
        .mockResolvedValue(fetchedData);
      return { listHandler, mockedFetchDataInternal };
    }

    it('should use first item as anchor when direction is newer', async () => {
      const { listHandler, mockedFetchDataInternal } = setupTaskListHandler({
        fetchedData: [
          {
            id: 1003282441,
            created_at: 104,
            post_ids: [104],
            group_ids: [1],
            complete: false,
          },
        ],
      });
      // item;
      const items = await listHandler.fetchData(QUERY_DIRECTION.NEWER, 20);

      expect(mockedFetchDataInternal).toBeCalledWith(
        QUERY_DIRECTION.NEWER,
        20,
        expect.objectContaining({ id: 16393 }),
      );
      expect(items[0]).toHaveProperty('id', 1003282441);
    });

    it('should use last item as anchor when direction is older', async () => {
      const { listHandler, mockedFetchDataInternal } = setupTaskListHandler();

      await listHandler.fetchData(QUERY_DIRECTION.OLDER, 20);
      expect(mockedFetchDataInternal).toBeCalledWith(
        QUERY_DIRECTION.OLDER,
        20,
        expect.objectContaining({ id: 736043017 }),
      );
    });

    it('should use latest post id as sortKey', async () => {
      const { listHandler } = setupFileListHandler();
      expect(listHandler.listStore.first()).toEqual(
        expect.objectContaining({ sortValue: 1879384074 }),
      );
    });

    it('should use default page size', async () => {
      const { listHandler, mockedFetchDataInternal } = setupTaskListHandler();

      await listHandler.fetchData(QUERY_DIRECTION.OLDER);
      expect(mockedFetchDataInternal).toBeCalledWith(
        QUERY_DIRECTION.OLDER,
        DEFAULT_PAGE_SIZE,
        expect.objectContaining({ id: 736043017 }),
      );
    });
  });

  describe('hasMore()', () => {
    it('should be true in older direction', () => {
      const { listHandler } = setup({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
        items: [],
      });
      expect(listHandler.hasMore(QUERY_DIRECTION.OLDER)).toBeTruthy();
    });

    it('should be false in older direction and size===total', () => {
      const { listHandler } = setup({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
        items: [
          {
            id: 2147459081,
            created_at: 100,
            post_ids: [101],
            group_ids: [1],
          },
        ],
      });
      Object.assign(listHandler, { _total: 1 });
      expect(listHandler.hasMore(QUERY_DIRECTION.OLDER)).toBeFalsy();
    });

    it('should be false in newer direction', () => {
      const { listHandler } = setup({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
        items: [],
      });
      expect(listHandler.hasMore(QUERY_DIRECTION.NEWER)).toBeFalsy();
    });

    it('should be false in newer direction and size===total', () => {
      const { listHandler } = setup({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
        items: [
          {
            id: 2147459081,
            created_at: 100,
            post_ids: [101],
            group_ids: [1],
          },
        ],
      });
      Object.assign(listHandler, { _total: 1 });
      expect(listHandler.hasMore(QUERY_DIRECTION.NEWER)).toBeFalsy();
    });
  });

  describe('dispose()', () => {
    it('should dispose mobx reactions', () => {
      const disposeFn = jest.fn();
      const { listHandler } = setup({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
        items: [],
      });
      Object.assign(listHandler, { _disposers: [disposeFn] });

      listHandler.dispose();

      expect(disposeFn).toBeCalled();
    });
  });

  describe('data syncing', () => {
    it('should show new created item [JPT-850] [JPT-843]', () => {
      const groupId = 1;
      const type = RIGHT_RAIL_ITEM_TYPE.TASKS;
      const typeId = getTypeId(type);
      const receivedItem = {
        id: 2147475465,
        type_id: typeId,
        group_ids: [1],
        post_ids: [101],
        complete: false,
        created_at: 100,
      };
      const { listHandler } = setup({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
        items: [],
      });
      triggerReceiveItem(groupId, receivedItem);
      expect(listHandler.listStore.items).toEqual([
        {
          id: 2147475465,
          sortValue: 2147475465,
          data: { created_at: 100, id: 2147475465 },
        },
      ]);
    });

    it('should remove deleted item [JPT-851, JPT-844]', () => {
      const groupId = 1;

      const { listHandler } = setup({
        groupId: 1,
        type: RIGHT_RAIL_ITEM_TYPE.TASKS,
        items: [
          {
            id: -2147459081,
            created_at: 100,
            post_ids: [101],
            group_ids: [1],
          },
        ],
      });

      triggerDeleteItem(groupId, { id: -2147459081 });

      expect(listHandler.listStore.size).toBe(0);
    });
  });
});
