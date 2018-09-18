/*
* @Author: Shining Miao (shining.miao@ringcentral.com)
* @Date: 2018-05-08 10:35:17
* Copyright © RingCentral. All rights reserved.
*/
import OrderListHandler from '../OrderListHandler';
import storeManager from '../StoreManager';
import { ENTITY_NAME } from '../../constants';

describe('OrderListHandler', () => {
  const handler: OrderListHandler<any, any> = new OrderListHandler(
    () => {
      return true;
    },
    () => ({ id: 111, sortKey: 222 }),
  );

  const orderListStore = handler.getStore();

  beforeAll(() => {
    jest.spyOn(orderListStore, 'batchSet');
    jest.spyOn(orderListStore, 'batchRemove');
  });

  describe('handleIncomingData()', () => {
    beforeAll(() => {
      const idArray = [
        {
          id: 2,
          sortKey: 1111,
        },
        {
          id: 1,
          sortKey: 2222,
        },
        {
          id: 3,
          sortKey: 3333,
        },
      ];
      orderListStore.batchSet(idArray);
    });
    it('store should be batch set with matchedIDSortKeyArray', () => {
      jest.spyOn(handler, 'updateEntityStore');
      handler.handleIncomingData(ENTITY_NAME.PRESENCE, {
        type: 'put',
        entities: new Map([[111, { name: 'alan', id: 111 }]]),
      });
      expect(handler.updateEntityStore).toHaveBeenCalledWith(
        ENTITY_NAME.PRESENCE,
        [
          {
            name: 'alan',
            id: 111,
          },
        ],
      );
      expect(orderListStore.batchSet).toHaveBeenCalledWith([
        { id: 111, sortKey: 222 },
      ]);
      expect(orderListStore.batchRemove).toHaveBeenCalledWith([]);
    });

    it('store should not be batch set with matchedIDSortKeyArray', () => {
      jest.spyOn(handler, 'updateEntityStore');
      handler.handleIncomingData(ENTITY_NAME.PRESENCE, {
        type: 'put',
        entities: new Map(),
      });
      expect(handler.updateEntityStore).not.toHaveBeenCalledWith(
        ENTITY_NAME.PRESENCE,
        [],
      );
      expect(orderListStore.batchSet).toHaveBeenCalledWith([
        { id: 2, sortKey: 1111 },
        { id: 1, sortKey: 2222 },
        { id: 3, sortKey: 3333 },
      ]);
      expect(orderListStore.batchRemove).toHaveBeenCalledWith([]);
    });

    it('store should be batch remove with notMatchedKeys', () => {
      jest.spyOn(handler, 'updateEntityStore');
      handler.handleIncomingData(ENTITY_NAME.PRESENCE, {
        type: 'put',
        entities: new Map([[111, { name: 'alan', id: 111 }]]),
      });
      expect(handler.updateEntityStore).toHaveBeenCalledWith(
        ENTITY_NAME.PRESENCE,
        [{ name: 'alan', id: 111 }],
      );
      expect(orderListStore.batchSet).toHaveBeenCalledWith([
        { id: 111, sortKey: 222 },
      ]);
      expect(orderListStore.batchRemove).toHaveBeenCalledWith([]);
    });

    it('store should be batch remove when type is delete', () => {
      handler.handleIncomingData(ENTITY_NAME.PRESENCE, {
        type: 'delete',
        entities: new Map([[111, { name: 'alan', id: 111 }]]),
      });
      expect(orderListStore.batchRemove).toHaveBeenCalled();
    });

    it('idSortKey in matchedKeys', () => {
      jest.spyOn(handler, 'updateEntityStore');
      handler.handleIncomingData(ENTITY_NAME.PRESENCE, {
        type: 'put',
        entities: new Map([[1, { name: 'tom', id: 1 }]]),
      });
      expect(handler.updateEntityStore).toHaveBeenCalledWith(
        ENTITY_NAME.PRESENCE,
        [
          {
            name: 'tom',
            id: 1,
          },
        ],
      );
      expect(orderListStore.batchSet).toHaveBeenCalledWith([
        { id: 111, sortKey: 222 },
      ]);
      expect(orderListStore.batchRemove).toHaveBeenCalledWith([]);
    });
  });
  describe('getStore()', () => {
    it('should return orderListStore', () => {
      expect(handler.getStore()).toEqual(orderListStore);
    });
  });
  describe('handlePageData()', () => {
    beforeAll(() => {
      jest.spyOn(handler, 'updateEntityStore');
    });
    it('store should not be batch set with handleData', () => {
      handler.handlePageData(ENTITY_NAME.GROUP, [], true);
      expect(handler.updateEntityStore).not.toHaveBeenCalledWith(
        ENTITY_NAME.GROUP,
        [],
      );
      // expect(orderListStore.batchSet).not.toHaveBeenCalledWith([]);
    });
    it('store should be batch set with handleData by isBigger as true', () => {
      handler.handlePageData(ENTITY_NAME.GROUP, [{ id: 222 }], true);
      expect(handler.updateEntityStore).toHaveBeenCalledWith(
        ENTITY_NAME.GROUP,
        [{ id: 222 }],
      );
      expect(orderListStore.batchSet).toHaveBeenCalledWith([]);
    });
    it('store should be batch set with handleData by isBigger as false', () => {
      handler.handlePageData(ENTITY_NAME.GROUP, [{ id: 222 }], false);
      expect(handler.updateEntityStore).toHaveBeenCalledWith(
        ENTITY_NAME.GROUP,
        [{ id: 222 }],
      );
      expect(orderListStore.batchSet).toHaveBeenCalledWith([]);
    });
  });
  describe('updateEntityStore', () => {
    it('storeManager should call dispatchUpdatedDataModels', () => {
      jest.spyOn(storeManager, 'dispatchUpdatedDataModels');
      handler.updateEntityStore(ENTITY_NAME.GROUP, [{ id: 222 }]);
      expect(storeManager.dispatchUpdatedDataModels).toHaveBeenCalledWith(
        ENTITY_NAME.GROUP,
        [{ id: 222 }],
      );
    });

    it('storeManager should not call dispatchUpdatedDataModels', () => {
      jest.spyOn(storeManager, 'dispatchUpdatedDataModels');
      handler.updateEntityStore(ENTITY_NAME.GROUP, []);
      expect(storeManager.dispatchUpdatedDataModels).not.toHaveBeenCalledWith(
        ENTITY_NAME.GROUP,
        [],
      );
    });
  });
});
