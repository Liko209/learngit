/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-26 21:33:16
 * Copyright © RingCentral. All rights reserved.
 */
import GroupModel from '../Group';
import { Group } from 'sdk/models';
import { UserConfig } from 'sdk/service/account/UserConfig';
import { PERMISSION_ENUM } from 'sdk/service';
jest.mock('sdk/api');
jest.mock('sdk/service/account/UserConfig');
const mockGroupService = {
  isCurrentUserHasPermission: jest.fn(),
};
jest.mock('sdk/module/group', () => {
  return {
    GroupService: () => mockGroupService,
  };
});

jest.mock('sdk/api');

describe('GroupModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    UserConfig.getCurrentUserId = jest.fn().mockImplementation(() => 1);
    UserConfig.getCurrentCompanyId = jest.fn().mockImplementation(() => 11);
  });
  describe('isThePersonGuest()', () => {
    it('should return result base on whether person company is in guest_user_company_ids', () => {
      const personA = { id: 10, company_id: 1 };
      const personB = { id: 10, company_id: 4 };
      const gm = GroupModel.fromJS({
        id: 1,
        guest_user_company_ids: [1, 2, 3],
      } as Group);
      expect(gm.isThePersonGuest(personA.company_id)).toBeTruthy;
      expect(gm.isThePersonGuest(personB.company_id)).toBeFalsy;
    });
  });
  describe('canPost', () => {
    it('should call GroupService.isCurrentUserHasPermission with correct params', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        guest_user_company_ids: [1, 2, 3],
        is_team: false,
      } as Group);
      mockGroupService.isCurrentUserHasPermission.mockReturnValue(true);
      expect(gm.canPost).toBeTruthy();
      mockGroupService.isCurrentUserHasPermission.mockReturnValue(false);
      expect(gm.canPost).toBeFalsy();
      expect(mockGroupService.isCurrentUserHasPermission).toBeCalledWith(
        gm.teamPermissionParams,
        PERMISSION_ENUM.TEAM_POST,
      );
    });
  });
});
