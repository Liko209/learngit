/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-06 22:27:29
 * Copyright © RingCentral. All rights reserved.
 */
import BaseNotificationSubscribable from '../BaseNotificationSubscribable';
import { notificationCenter } from 'sdk/service';

// Using manual mock to improve mock priority.
// jest.mock('sdk/service', () => jest.genMockFromModule<any>('sdk'));

let baseNotificationSubscribable: BaseNotificationSubscribable;

describe('BaseNotificationSubscribable', () => {
  beforeAll(() => {
    baseNotificationSubscribable = new BaseNotificationSubscribable();
  });

  describe('subscribeNotificationOnce()', () => {
    it('notificationCenter once should be called', () => {
      const spy = jest.spyOn(notificationCenter, 'once');
      const callback = () => {};
      const notificationObservers = baseNotificationSubscribable.getNotificationObservers();
      baseNotificationSubscribable.subscribeNotificationOnce('group', callback);
      expect(notificationObservers['group'].length).toBe(1);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribeNotification()', () => {
    it('notificationCenter on should be called', () => {
      const spy = jest.spyOn(notificationCenter, 'on');
      const callback = () => {};
      const notificationObservers = baseNotificationSubscribable.getNotificationObservers();
      baseNotificationSubscribable.subscribeNotification('post', callback);
      expect(notificationObservers['post'].length).toBe(1);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('dispose()', () => {
    it('baseNotificationSubscribable notificationObservers size should be 0', () => {
      const spy = jest.spyOn(notificationCenter, 'removeListener');
      baseNotificationSubscribable.dispose();
      const notificationObservers = baseNotificationSubscribable.getNotificationObservers();
      expect(Object.keys(notificationObservers).length).toBe(0);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });
});
