/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-01 11:14:07
 * Copyright © RingCentral. All rights reserved.
 */
import { RCVideoMeetingItemService } from '../RCVideoMeetingItemService';

describe('RCVideoMeetingItemService', () => {
  describe('rcVideoMeetingItemController', () => {
    it('should not return null', () => {
      const service = new RCVideoMeetingItemService();
      expect(service['_rcVideoMeetingItemController']).not.toBeNull();
    });
  });
});
