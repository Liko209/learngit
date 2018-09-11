/*
* @Author: Shining Miao (shining.miao@ringcentral.com)
* @Date: 2018-05-08 10:35:17
* Copyright © RingCentral. All rights reserved.
*/
import OrderListPresenter from '../OrderListPresenter';
import OrderListStore from '../OrderListStore';

describe('OrderListPresenter', () => {
  const orderListStore = new OrderListStore('group');
  let presenter: OrderListPresenter<any, any>;

  beforeAll(() => {
    jest.spyOn(orderListStore, 'batchSet');
    jest.spyOn(orderListStore, 'batchRemove');
    jest.spyOn(orderListStore, 'dispose');
  });

  // describe('setPageSize', () => {
  //   it('presenter pageSize should be set', () => {
  //     presenter.setPageSize(2);
  //   });
  // });

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
      presenter = new OrderListPresenter(
        orderListStore,
        () => {
          return true;
        },
        () => ({ id: 111, sortKey: 222 }),
      );
      jest.spyOn(presenter, 'updateEntityStore');
      presenter.handleIncomingData('presence', {
        type: 'put',
        entities: new Map([[111, { name: 'alan', id: 111 }]]),
      });
      expect(presenter.updateEntityStore).toHaveBeenCalledWith('presence', [
        {
          name: 'alan',
          id: 111,
        },
      ]);
      expect(orderListStore.batchSet).toHaveBeenCalledWith([
        { id: 111, sortKey: 222 },
      ]);
      expect(orderListStore.batchRemove).toHaveBeenCalledWith([]);
    });

    it('store should not be batch set with matchedIDSortKeyArray', () => {
      presenter = new OrderListPresenter(
        orderListStore,
        () => {
          return true;
        },
        () => ({ id: 111, sortKey: 222 }),
      );
      jest.spyOn(presenter, 'updateEntityStore');
      presenter.handleIncomingData('presence', {
        type: 'put',
        entities: new Map(),
      });
      expect(presenter.updateEntityStore).not.toHaveBeenCalledWith(
        'presence',
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
      presenter = new OrderListPresenter(
        orderListStore,
        () => {
          return false;
        },
        () => ({ id: 111, sortKey: 222 }),
      );
      jest.spyOn(presenter, 'updateEntityStore');
      presenter.handleIncomingData('presence', {
        type: 'put',
        entities: new Map([[111, { name: 'alan', id: 111 }]]),
      });
      expect(presenter.updateEntityStore).toHaveBeenCalledWith('presence', []);
      expect(orderListStore.batchSet).toHaveBeenCalledWith([
        { id: 111, sortKey: 222 },
      ]);
      expect(orderListStore.batchRemove).toHaveBeenCalledWith([111]);
    });

    it('store should be batch remove when type is delete', () => {
      presenter = new OrderListPresenter(
        orderListStore,
        () => {
          return true;
        },
        () => ({ id: 111, sortKey: 222 }),
      );
      presenter.handleIncomingData('presence', {
        type: 'delete',
        entities: new Map([[111, { name: 'alan', id: 111 }]]),
      });
      expect(orderListStore.batchRemove).toHaveBeenCalled();
    });

    it('idSortKey in matchedKeys', () => {
      presenter = new OrderListPresenter(
        orderListStore,
        () => {
          return true;
        },
        () => ({ id: 1, sortKey: 1112 }),
      );
      jest.spyOn(presenter, 'updateEntityStore');
      presenter.handleIncomingData('presence', {
        type: 'put',
        entities: new Map([[1, { name: 'tom', id: 1 }]]),
      });
      expect(presenter.updateEntityStore).toHaveBeenCalledWith('presence', [
        {
          name: 'tom',
          id: 1,
        },
      ]);
      expect(orderListStore.batchSet).toHaveBeenCalledWith([
        { id: 1, sortKey: 1112 },
      ]);
      expect(orderListStore.batchRemove).toHaveBeenCalledWith([]);
    });
  });
  describe('getStore()', () => {
    it('should return orderListStore', () => {
      expect(presenter.getStore()).toEqual(orderListStore);
    });
  });
  describe('handlePageData()', () => {
    beforeAll(() => {
      presenter = new OrderListPresenter(
        orderListStore,
        () => {
          return true;
        },
        () => ({ id: 111, sortKey: 222 }),
      );
      jest.spyOn(presenter, 'updateEntityStore');
    });
    it('store should not be batch set with handleData', () => {
      presenter.handlePageData('group', [], true);
      expect(presenter.updateEntityStore).not.toHaveBeenCalledWith('group', []);
      // expect(orderListStore.batchSet).not.toHaveBeenCalledWith([]);
    });
    it('store should be batch set with handleData by isBigger as true', () => {
      presenter.handlePageData('group', [{ id: 222 }], true);
      expect(presenter.updateEntityStore).toHaveBeenCalledWith('group', [
        { id: 222 },
      ]);
      expect(orderListStore.batchSet).toHaveBeenCalledWith([]);
    });
    it('store should be batch set with handleData by isBigger as false', () => {
      presenter.handlePageData('group', [{ id: 222 }], false);
      expect(presenter.updateEntityStore).toHaveBeenCalledWith('group', [
        { id: 222 },
      ]);
      expect(orderListStore.batchSet).toHaveBeenCalledWith([]);
    });
  });
  describe('dipose()', () => {
    it('presenter dispose should be called', () => {
      presenter.dispose();
      expect(orderListStore.dispose).toHaveBeenCalled();
    });
  });
});
