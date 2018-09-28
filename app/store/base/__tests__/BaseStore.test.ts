/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-06 21:58:36
 * Copyright © RingCentral. All rights reserved.
 */
import BaseStore from '../BaseStore';
import BaseNotificationSubscribable from '../BaseNotificationSubscribable';
import { ENTITY_NAME } from '../../constants';

jest.mock('../BaseNotificationSubscribable', () =>
  jest.fn().mockImplementation(() => {}),
);

describe('BaseStore', () => {
  it('new BaseStore', () => {
    const store = new BaseStore(ENTITY_NAME.GROUP);
    expect(BaseNotificationSubscribable).toHaveBeenCalledTimes(1);
    expect(store.name).toBe(ENTITY_NAME.GROUP);
  });
});
