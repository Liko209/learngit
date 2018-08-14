/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-06 21:58:36
 * Copyright © RingCentral. All rights reserved.
 */
import BaseStore from '../BaseStore';
import BaseNotificationSubscribable from '../BaseNotificationSubscribable';

jest.mock('../BaseNotificationSubscribable', () =>
  jest.fn().mockImplementation(() => {})
);

describe('BaseStore', () => {
  it('new BaseStore', () => {
    const store = new BaseStore('group');
    expect(BaseNotificationSubscribable).toHaveBeenCalledTimes(1);
    expect(store.name).toBe('group');
  });
});
