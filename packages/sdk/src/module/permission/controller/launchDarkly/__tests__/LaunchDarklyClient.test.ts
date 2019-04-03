/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-03-01 22:19:15
 * Copyright © RingCentral. All rights reserved.
 */

import { LaunchDarklyClient } from '../LaunchDarklyClient';
LaunchDarklyClient.prototype._initLDClient = () => {};

describe('LaunchDarklyClient', () => {
  describe('hasPermission', () => {
    it('should return false if flags has not been initialized', () => {
      const client = new LaunchDarklyClient(null);
      const result = client.hasPermission('KEY_1');
      expect(result).toBeFalsy();
    });
    it('should return false if key is not in flags', () => {
      const client = new LaunchDarklyClient(null);
      Object.assign(client, {
        _flags: { JUPITER_CAN_SHOW_IMAGE_DIALOG: false },
      });
      const result = client.hasPermission('KEY_1');
      expect(result).toBeFalsy();
    });

    it('should return true if key is in flags and the value is true', () => {
      const client = new LaunchDarklyClient(null);
      Object.assign(client, {
        _flags: { JUPITER_CAN_SHOW_IMAGE_DIALOG: true },
      });
      const result = client.hasPermission('JUPITER_CAN_SHOW_IMAGE_DIALOG');
      expect(result).toBeTruthy();
    });
  });
  describe('shutdown', () => {
    it('should call off twice when shutdown', () => {
      class MockClient {
        on() {}
        off() {}
        setStreaming() {}
      }
      const mc = new MockClient();
      jest.spyOn(mc, 'off').mockImplementation(() => {});
      jest.spyOn(mc, 'setStreaming').mockImplementation(() => {});
      const ld = new LaunchDarklyClient(null);
      Object.assign(ld, {
        _ldclient: mc,
      });
      ld.shutdown();
      expect(mc.off).toHaveBeenCalledTimes(2);
      expect(mc.setStreaming).toHaveBeenCalledTimes(1);
    });
  });
});
