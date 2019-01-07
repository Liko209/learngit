/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2019-01-02 14:29:58
 * Copyright © RingCentral. All rights reserved.
 */

import { rtcRestApiManager } from '../RTCRestApiManager';

describe('rtcRestApiManager', async () => {
  describe('setNetworkDelegate()', () => {
    it('should _httpClientDelegate is null when initialization', () => {
      const ram = rtcRestApiManager;
      expect(ram.getClient()).toBe(null);
    });
    it('should _httpClientDelegate is not null when setNetworkDelegate() be called', () => {
      const ram = rtcRestApiManager;
      const mockClient = 'test';
      ram.setNetworkDelegate(mockClient);
      expect(ram.getClient()).toBe(mockClient);
      ram.reset();
    });
  });
});
