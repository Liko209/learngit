/*
 * @Author: Andy Hu
 * @Date: 2018-09-16 13:40:24
 * Copyright © RingCentral. All rights reserved.
 */

import { ListStore } from '../ListStore';
import { TransformHandler } from '../TransformHandler';
import { OrderListHandler } from '../OrderListHandler';

jest.mock('../OrderListHandler');
const store = new ListStore();
const noop =
  // const orderListHandler = new OrderListHandler();
  // const transformHandler = new TransformHandler(orderListHandler);

  jest.spyOn(store.atom, 'reportChanged');

describe('TransformHandler', () => {});
