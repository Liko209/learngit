/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-29 16:11:31
 * Copyright © RingCentral. All rights reserved.
 */

import { MeetingItemService } from '../MeetingItemService';
describe('MeetingItemService', () => {
  describe('meetingItemController', () => {
    it('should not return null', () => {
      const service = new MeetingItemService();
      expect(service['_meetingItemController']).not.toBeNull();
    });
  });
});
