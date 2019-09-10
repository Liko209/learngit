/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-23 15:50:29
 * Copyright © RingCentral. All rights reserved.
 */
import { LaunchDarklyClient } from '../LaunchDarklyClient';
import { initialize } from 'launchdarkly-js-client-sdk';

jest.mock('launchdarkly-js-client-sdk');
initialize = jest.fn().mockReturnValue({
  on: jest.fn(),
  off: jest.fn(),
  setStreaming: jest.fn(),
});

describe('LaunchDarklyClient', () => {
  function getClient(flags: object = {}) {
    const ld = new LaunchDarklyClient({});
    Object.assign(ld, {
      _flags: flags,
    });
    return ld;
  }

  describe('hasPermission', () => {
    it('should return true when has has permission', () => {
      const ld = getClient({
        JUPITER_CREATE_TEAM: true,
      });

      expect(ld.hasPermission('JUPITER_CREATE_TEAM')).toBeTruthy();
    });
    it('should return false when permission is false ', () => {
      const ld = getClient({
        JUPITER_CREATE_TEAM: false,
      });

      expect(ld.hasPermission('JUPITER_CREATE_TEAM')).toBeFalsy();
    });
    it('should return false when permission is undefined', () => {
      const ld = getClient({});

      expect(ld.hasPermission('JUPITER_CREATE_TEAM')).toBeFalsy();
    });
    it('should return false when permission flag is initialized as undefined', () => {
      const ld = getClient(undefined);

      expect(ld.hasPermission('JUPITER_CREATE_TEAM')).toBeFalsy();
    });
  });
  describe('getFeatureFlag', () => {
    it('should return undefined when has not this flag', () => {
      const ld = getClient({});

      expect(ld.getFeatureFlag('JUPITER_CREATE_TEAM')).toEqual(undefined);
    });
    it('should return undefined when flags is initialed as undefined', () => {
      const ld = getClient(undefined);

      expect(ld.getFeatureFlag('JUPITER_CREATE_TEAM')).toEqual(undefined);
    });
    it('should return flag original value when has this flag', () => {
      const ld = getClient({
        JUPITER_CREATE_TEAM: 80,
      });

      expect(ld.getFeatureFlag('JUPITER_CREATE_TEAM')).toEqual(80);
    });
  });
  describe('hasFlags', () => {
    it('should return false when flags is initialed as undefined', () => {
      const ld = getClient(undefined);

      expect(ld.hasFlags()).toBeFalsy();
    });
    it('should return false when flags is empty object', () => {
      const ld = getClient({});

      expect(ld.hasFlags()).toBeFalsy();
    });
    it('should return true when flags has value', () => {
      const ld = getClient({ JUPITER_CREATE_TEAM: 80 });

      expect(ld.hasFlags()).toBeTruthy();
    });
  });

  describe('shutdown', () => {
    it('should clear local cache data', () => {
      localStorage.removeItem = jest.fn();
      Object.assign(localStorage, {
        'ld:xxdaf:0asdfx==': 'a',
      });
      const ld = getClient({ JUPITER_CREATE_TEAM: 80 });
      ld.shutdown(true);
      expect(ld.hasFlags()).toBeFalsy();
      expect(localStorage.removeItem).toHaveBeenCalled();
    });

    it('should not clear local cache data', () => {
      localStorage.removeItem = jest.fn();
      Object.assign(localStorage, {
        'ld:xxdaf:0asdfx==': 'a',
      });
      const ld = getClient({ JUPITER_CREATE_TEAM: 80 });
      ld.shutdown(false);
      expect(ld.hasFlags()).toBeFalsy();
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });
  });
});
