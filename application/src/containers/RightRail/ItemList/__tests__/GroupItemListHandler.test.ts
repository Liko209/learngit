/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-25 13:53:31
 * Copyright © RingCentral. All rights reserved.
 */
import { flushPromises } from 'test-util/flushPromises';
import notificationCenter from 'sdk/service/notificationCenter';
import { ItemNotification, ItemService } from 'sdk/module/item';
import { EVENT_TYPES } from 'sdk/service';
import { Item } from 'sdk/module/item/entity';
import { GlipTypeUtil } from 'sdk/utils/glip-type-dictionary';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { QUERY_DIRECTION } from 'sdk/dao';
import { GroupItemListHandler } from '../GroupItemListHandler';
import { RIGHT_RAIL_ITEM_TYPE } from '../constants';
import { getTypeId } from '../utils';

function setup(
  groupId: number,
  type: RIGHT_RAIL_ITEM_TYPE,
  sortableModels: any[],
) {
  const listHandler = new GroupItemListHandler(groupId, type);
  listHandler.listStore.append(sortableModels);
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

function buildItem(id: number) {
  return {
    id,
    type_id: GlipTypeUtil.extractTypeId(id),
    group_ids: [1],
    post_ids: [10],
    complete: false,
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
  let itemService: ItemService;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
  });

  describe('total', () => {
    beforeEach(() => {
      jest.spyOn(itemService, 'getGroupItemsCount');
    });

    it('should be Infinity by default then fetch total', async () => {
      itemService.getGroupItemsCount.mockResolvedValue(100);

      const { listHandler } = setup(1, RIGHT_RAIL_ITEM_TYPE.TASKS, []);
      expect(listHandler.total).toBe(Infinity);
      await flushPromises();

      expect(listHandler.total).toBe(100);
    });

    it('should fetch total when list changed [JPT-983, JPT-984]', async () => {
      const groupId = 1;

      itemService.getGroupItemsCount.mockResolvedValue(100);
      const { listHandler } = setup(groupId, RIGHT_RAIL_ITEM_TYPE.TASKS, []);
      expect(listHandler.total).toBe(Infinity);
      await flushPromises();

      expect(listHandler.total).toBe(100);

      itemService.getGroupItemsCount.mockResolvedValue(101);
      triggerReceiveItem(groupId, buildItem(2147475465));
      await flushPromises();

      expect(listHandler.total).toBe(101);
    });
  });

  describe('fetchData()', () => {
    let listHandler: GroupItemListHandler;
    let mockedFetchDataInternal: jest.Mock;

    beforeEach(() => {
      ({ listHandler } = setup(1, RIGHT_RAIL_ITEM_TYPE.TASKS, [
        {
          id: 2147475465,
          sortValue: 2147475465,
          data: { created_at: 100, id: 2147475465 },
        },
        {
          id: 16375,
          sortValue: 16375,
          data: { created_at: 100, id: 16375 },
        },
        {
          id: -2147459081,
          sortValue: -2147459081,
          data: { created_at: 100, id: -2147459081 },
        },
      ]));
      mockedFetchDataInternal = jest
        .spyOn<any, any>(listHandler, 'fetchDataInternal')
        .mockResolvedValue([]);
    });

    it('should use first item as anchor when direction is newer', async () => {
      await listHandler.fetchData(QUERY_DIRECTION.NEWER, 20);
      expect(mockedFetchDataInternal).toBeCalledWith(
        QUERY_DIRECTION.NEWER,
        20,
        expect.objectContaining({ id: 2147475465 }),
      );
    });

    it('should use last item as anchor when direction is older', async () => {
      await listHandler.fetchData(QUERY_DIRECTION.OLDER, 20);
      expect(mockedFetchDataInternal).toBeCalledWith(
        QUERY_DIRECTION.OLDER,
        20,
        expect.objectContaining({ id: -2147459081 }),
      );
    });
  });

  describe('hasMore()', () => {
    it('should be true in older direction', () => {
      const { listHandler } = setup(1, RIGHT_RAIL_ITEM_TYPE.TASKS, []);
      expect(listHandler.hasMore(QUERY_DIRECTION.OLDER)).toBeTruthy();
    });

    it('should be false in newer direction', () => {
      const { listHandler } = setup(1, RIGHT_RAIL_ITEM_TYPE.TASKS, []);
      expect(listHandler.hasMore(QUERY_DIRECTION.NEWER)).toBeFalsy();
    });

    it('should be false in newer direction and size===total', () => {
      const { listHandler } = setup(1, RIGHT_RAIL_ITEM_TYPE.TASKS, [
        {
          id: 2147475465,
          sortValue: 2147475465,
          data: { created_at: 100, id: 2147475465 },
        },
      ]);
      Object.assign(listHandler, { _total: 1 });
      expect(listHandler.hasMore(QUERY_DIRECTION.OLDER)).toBeFalsy();
    });
  });

  describe('dispose()', () => {
    it('should dispose mobx reactions', () => {
      const disposeFn = jest.fn();
      const { listHandler } = setup(1, RIGHT_RAIL_ITEM_TYPE.TASKS, []);
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
        post_ids: [10],
        complete: false,
        created_at: 100,
      };
      const { listHandler } = setup(groupId, type, []);
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

      const { listHandler } = setup(groupId, RIGHT_RAIL_ITEM_TYPE.TASKS, [
        {
          id: 2147475465,
          sortValue: 2147475465,
          data: { created_at: 100, id: 2147475465 },
        },
      ]);

      triggerDeleteItem(groupId, { id: 2147475465 });

      expect(listHandler.listStore.size).toBe(0);
    });
  });
});
