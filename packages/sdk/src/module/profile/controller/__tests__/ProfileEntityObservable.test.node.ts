/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-08-23 16:03:37
 * Copyright © RingCentral. All rights reserved.
 */

import { ProfileEntityObservable } from '../ProfileEntityObservable';
import { SETTING_KEYS } from '../../constants';
function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}
describe('ProfileEntityObservable', () => {
  let profileEntityObservable: ProfileEntityObservable;
  const groupId = 1;
  const profile = {
    test1: { a: 1 },
    test2: [1, 2],
    test3: 1,
  };
  const originProfile = {
    test1: { a: 2 },
    test2: [1, 2, 3],
    test3: 2,
  };
  beforeEach(() => {
    profileEntityObservable = new ProfileEntityObservable();
  });
  afterEach(() => {
    clearMocks();
  });
  describe('onProfileUpdate', () => {
    it('should notify when value is not equal', () => {
      profileEntityObservable['_observers'] = new Map([
        ['test1', [1, 2]],
        ['test2', [1, 2]],
        ['test3', [1, 2]],
      ]);
      profileEntityObservable.notify = jest.fn();
      profileEntityObservable.onProfileUpdate(profile, originProfile);
      expect(profileEntityObservable.notify).toHaveBeenCalledTimes(6);
    });
  });
  describe('register', () => {
    it('should add 2 keys when observer keys length is 2', () => {
      const observer = { keys: [1, 2] };
      profileEntityObservable.register(observer);
      expect(profileEntityObservable['_observers'].size).toEqual(2);
    });
  });
  describe('unRegister', () => {
    it('should remove from map when run unRegister', () => {
      const observer = { keys: ['test1'] };
      profileEntityObservable['_observers'] = new Map([['test1', [observer]]]);
      profileEntityObservable.unRegister(observer);
      expect(profileEntityObservable['_observers'].get('test1').length).toEqual(
        0,
      );
    });
  });
  describe('unRegisterAll', () => {
    it('should get empty map when run unRegisterAll', () => {
      profileEntityObservable['_observers'] = new Map([['test1', [1, 2]]]);
      profileEntityObservable.unRegisterAll();
      expect(profileEntityObservable['_observers'].size).toEqual(0);
    });
  });
  describe('notify', () => {
    it('should call update when run notify', () => {
      const update = jest.fn();
      const observer = { keys: ['test1'], update };
      profileEntityObservable['_observers'] = new Map([['test1', [observer]]]);
      profileEntityObservable.notify(observer, 1, 2);
      expect(observer.update).toBeCalledWith(1, 2);
    });
  });
});
