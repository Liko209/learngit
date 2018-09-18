/*
 * @Author: Andy Hu
 * @Date: 2018-09-16 13:40:24
 * Copyright © RingCentral. All rights reserved.
 */

import { ListStore } from '../ListStore';
import { TransformHandler } from '../TransformHandler';
import { OrderListHandler, BIND_EVENT } from '../OrderListHandler';

jest.mock('../ListStore');

const noop = () => {};
const orderListHandler: any = new OrderListHandler(noop, noop);
console.log(OrderListHandler);
let transformHandler;

describe('TransformHandler', () => {
  beforeAll(() => {
    orderListHandler.on = jest.fn();
    orderListHandler.handlePageData = jest.fn();
    orderListHandler.handleIncomingData = jest.fn();
    transformHandler = new TransformHandler(orderListHandler);
  });
  it('should subscribe modification once constructed', () => {
    expect(orderListHandler.on).toHaveBeenCalled();
    expect(orderListHandler.on).toHaveBeenCalledWith(
      BIND_EVENT.DATA_CHANGE,
      transformHandler.modificationHandler,
    );
  });
  describe('Proxy the func to orderLists', () => {
    it('should proxy handleIncoming data to orderlistHandler', () => {
      transformHandler.handleIncomingData(1, 1);
      expect(orderListHandler.handleIncomingData).toBeCalledWith(1, 1);
    });
    it('should proxy handlePageData data to orderlistHandler ', () => {
      transformHandler.handlePageData(1, 2, 3);
      expect(orderListHandler.handlePageData).toBeCalledWith(1, 2, 3);
    });
  });
});
