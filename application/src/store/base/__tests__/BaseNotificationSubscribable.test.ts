/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-05-06 22:27:29
 * Copyright © RingCentral. All rights reserved.
 */
import BaseNotificationSubscribable from '../BaseNotificationSubscribable';
import { service } from 'sdk';

const { notificationCenter } = service;
// Using manual mock to improve mock priority.
jest.mock('sdk', () => jest.genMockFromModule<any>('sdk'));

let baseNotificationSubscribable: any = () => {};

describe('BaseNotificationSubscribable', () => {
  beforeAll(() => {
    baseNotificationSubscribable = new BaseNotificationSubscribable();
  });

  describe('subscribeNotificationOnce()', () => {
    it('notificationCenter once should be called', () => {
      const callback = () => {};
      baseNotificationSubscribable.subscribeNotificationOnce('group', callback);
      expect(
        baseNotificationSubscribable.notificationObservers.has('group'),
      ).toBe(true);
      expect(notificationCenter.once).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribeNotification()', () => {
    it('notificationCenter on should be called', () => {
      const callback = () => {};
      baseNotificationSubscribable.subscribeNotification('post', callback);
      expect(
        baseNotificationSubscribable.notificationObservers.has('post'),
      ).toBe(true);
      expect(notificationCenter.on).toHaveBeenCalledTimes(1);
    });
  });

  describe('dispose()', () => {
    it('baseNotificationSubscribable notificationObservers size should be 0', () => {
      baseNotificationSubscribable.dispose();
      expect(baseNotificationSubscribable.notificationObservers.size).toBe(0);
      expect(notificationCenter.removeListener).toHaveBeenCalledTimes(2);
    });
  });
});
