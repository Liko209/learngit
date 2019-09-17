/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-13 15:03:41
 * Copyright © RingCentral. All rights reserved.
 */

import { PostNotificationController } from '../PostNotificationController';
import { ServiceLoader, ServiceConfig } from '../../../serviceLoader';
import { GroupService } from '../../../group';
import { AccountUserConfig } from '../../../account/config/AccountUserConfig';
import { AccountService } from 'sdk/module/account';

jest.mock('../../../group');
jest.mock('../../../account/config/AccountUserConfig');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PostNotificationController', () => {
  let groupService: GroupService;
  let postNotificationController: PostNotificationController;
  function setUp() {
    groupService = new GroupService();
    AccountUserConfig.prototype.getGlipUserId.mockReturnValue(1);

    const accountService = new AccountService({} as any);
    const serviceMap: Map<any, any> = new Map([
      [ServiceConfig.GROUP_SERVICE, groupService as any],
      [ServiceConfig.ACCOUNT_SERVICE, accountService as any],
    ]);
    ServiceLoader.getInstance = jest.fn().mockImplementation(serviceName => {
      return serviceMap.get(serviceName);
    });

    postNotificationController = new PostNotificationController();
  }

  describe('filter post', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    const posts = [
      { id: 3, creator_id: 2, group_id: 5 },
      { id: 4, creator_id: 2, group_id: 5 },
      { id: 5, creator_id: 1, group_id: 5 },
      { id: 6, creator_id: 2, group_id: 5 },
    ];

    it('should filter my post', () => {
      groupService.getSynchronously = jest
        .fn()
        .mockReturnValue({ most_recent_post_id: -1 });
      const res = posts.filter(postNotificationController['_filterFunc']!);
      expect(res).toEqual([posts[0], posts[1], posts[3]]);
    });

    it('should filter post older than group most recent post ', () => {
      groupService.getSynchronously = jest
        .fn()
        .mockReturnValue({ most_recent_post_id: 4 });
      const res = posts.filter(postNotificationController['_filterFunc']!);
      expect(res).toEqual([posts[3]]);
    });

    it('should filter sms post', () => {
      groupService.getSynchronously = jest
        .fn()
        .mockReturnValue({ most_recent_post_id: 4 });
      const res = [
        { id: 7, is_sms: true, creator_id: 2, group_id: 5 },
        { id: 7, is_sms: false, creator_id: 2, group_id: 5 },
      ].filter(postNotificationController['_filterFunc']!);
      expect(res).toEqual([
        { id: 7, is_sms: false, creator_id: 2, group_id: 5 },
      ]);
    });
  });
});
