/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2019-01-02 14:29:58
 * Copyright © RingCentral. All rights reserved.
 */

import { rtcRestApiManager } from '../RTCRestApiManager';

describe('rtcRestApiManager', async () => {
  describe('setClient()', () => {
    it('should _httpClient is null when initialization', () => {
      const ram = rtcRestApiManager;
      expect(ram.getClient()).toBe(null);
    });
    it('should _httpClient is not null when setClient() be called', () => {
      const ram = rtcRestApiManager;
      const mockClient = 'test';
      ram.setClient(mockClient);
      expect(ram.getClient()).toBe(mockClient);
      ram.reset();
    });
  });
});
