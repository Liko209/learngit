/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-26 21:33:16
 * Copyright © RingCentral. All rights reserved.
 */
import GroupModel from '../Group';
import { Group } from 'sdk/models';
import { PERMISSION_ENUM } from 'sdk/service';
import { ENTITY_NAME } from '@/store';
import { getEntity } from '@/store/utils';
import { GlobalConfigService } from 'sdk/module/config';
import { AccountUserConfig } from 'sdk/module/account/config';
import i18next from 'i18next';

jest.mock('sdk/api');
jest.mock('sdk/module/account/config');
jest.mock('@/store/utils/entities');
jest.mock('sdk/module/config');
GlobalConfigService.getInstance = jest.fn();

describe('GroupModel', () => {
  const mockUserId = 1;
  const mockUserCompanyId = 11;
  beforeEach(() => {
    jest.resetAllMocks();

    AccountUserConfig.prototype.getGlipUserId.mockReturnValue(mockUserId);

    AccountUserConfig.prototype.getCurrentCompanyId.mockReturnValue(
      mockUserCompanyId,
    );

    (getEntity as jest.Mock).mockImplementation((name: string) => {
      if (name === ENTITY_NAME.PERSON) {
        return {
          companyId: mockUserCompanyId,
        };
      }
    });
  });
  describe('isThePersonGuest()', () => {
    it('should return result base on whether person company is in guest_user_company_ids', () => {
      const gm1 = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [mockUserCompanyId],
      } as Group);
      const gm2 = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [mockUserCompanyId + 1],
      } as Group);
      expect(gm1.isThePersonGuest(mockUserId)).toBeTruthy();
      expect(gm2.isThePersonGuest(mockUserId)).toBeFalsy();
    });
  });
  describe('canPost', () => {
    it('should return false when user is guest||user and user permission setting disabled TEAM_POST', () => {
      const gmGuest = GroupModel.fromJS({
        id: 1,
        guest_user_company_ids: [mockUserCompanyId], // guest
        is_team: true,
        members: [mockUserId],
        permissions: {
          admin: {
            uids: [2],
          },
          user: {
            level: 0,
          },
        },
      } as Group);
      expect(gmGuest.canPost).toBeFalsy();
      // normal user
      const gmUser = GroupModel.fromJS({
        id: 1,
        is_team: true,
        guest_user_company_ids: [],
        members: [mockUserId],
        permissions: {
          admin: {
            uids: [2],
          },
          user: {
            level: 0,
          },
        },
      } as Group);
      expect(gmUser.canPost).toBeFalsy();
    });
    it('should return true when user is guest||user and user permission setting enabled TEAM_POST', () => {
      const gmGuest = GroupModel.fromJS({
        id: 1,
        guest_user_company_ids: [mockUserCompanyId], // guest
        is_team: true,
        members: [mockUserId],
        permissions: {
          admin: {
            uids: [2],
          },
          user: {
            level: PERMISSION_ENUM.TEAM_POST,
          },
        },
      } as Group);
      expect(gmGuest.canPost).toBeTruthy();
      // normal user
      const gmUser = GroupModel.fromJS({
        id: 1,
        guest_user_company_ids: [],
        is_team: true,
        members: [mockUserId],
        permissions: {
          admin: {
            uids: [2],
          },
          user: {
            level: PERMISSION_ENUM.TEAM_POST,
          },
        },
      } as Group);
      expect(gmUser.canPost).toBeTruthy();
    });
    it('should return true when user is admin', () => {
      const gmAdmin = GroupModel.fromJS({
        id: 1,
        guest_user_company_ids: [],
        is_team: true,
        members: [mockUserId],
        permissions: {
          admin: {
            uids: [mockUserId], // admin
          },
          user: {
            level: PERMISSION_ENUM.TEAM_POST,
          },
        },
      } as Group);
      expect(gmAdmin.canPost).toBeTruthy();
    });
    it('should return true when group data is not ready', () => {
      const gmAdmin = new GroupModel({ id: 1, isMocked: true } as Group);
      expect(gmAdmin.canPost).toBeTruthy();
    });
  });
  describe('isAdmin', () => {
    it('should return true when user is in admin.uids', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [],
        is_team: true,
        permissions: {
          admin: {
            uids: [mockUserId],
          },
        },
      } as Group);
      // gm.isAdmin;
      expect(gm.isAdmin).toBeTruthy();
    });
    it('should return false when user is not in admin.uids', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [],
        is_team: true,
        permissions: {
          admin: {
            uids: [333],
          },
        },
      } as Group);
      expect(gm.isAdmin).toBeFalsy();
    });
    it('should return false when admin.uids not exist and user is guest', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [mockUserCompanyId],
        is_team: true,
        permissions: {
          admin: {
            uids: [],
          },
        },
      } as Group);
      expect(gm.isAdmin).toBeFalsy();
    });
    it('should return true when admin.uids not exist and user is not guest', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [],
        is_team: true,
        permissions: {
          admin: {
            uids: [],
          },
        },
      } as Group);
      expect(gm.isAdmin).toBeTruthy();
    });
  });
  describe('isThePersonAdmin', () => {
    it('should return true when user is in admin list', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [],
        is_team: true,
        permissions: {
          admin: {
            uids: [mockUserId],
          },
        },
      } as Group);
      expect(gm.isThePersonAdmin(mockUserId)).toBeTruthy();
    });
    it('should return false when user is not a member', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId + 1],
        guest_user_company_ids: [],
        is_team: true,
        permissions: {
          admin: {
            uids: [mockUserId + 1],
          },
        },
      } as Group);
      expect(gm.isThePersonAdmin(mockUserId)).toBeFalsy();
    });
    it('should return false when user is not in admin list', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [],
        is_team: true,
        permissions: {
          admin: {
            uids: [mockUserCompanyId + 1],
          },
        },
      } as Group);
      expect(gm.isThePersonAdmin(mockUserId)).toBeFalsy();
    });
    it('should return false when admin list is empty and user is a guest', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [mockUserCompanyId],
        is_team: true,
        permissions: {
          admin: {
            uids: [],
          },
        },
      } as Group);
      expect(gm.isThePersonAdmin(mockUserId)).toBeFalsy();
    });
    it('should return false when admin list is empty and user is not a guest', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [],
        is_team: true,
        permissions: {
          admin: {
            uids: [],
          },
        },
      } as Group);
      expect(gm.isThePersonAdmin(mockUserId)).toBeFalsy();
    });
  });

  describe('isMember', () => {
    // beforeEach(() => {
    //   (getGlobalValue as jest.Mock).mockImplementationOnce((key: any) => {
    //     if (key === GLOBAL_KEYS.CURRENT_USER_ID) {
    //       return 123;
    //     }
    //     return null;
    //   });
    // });
    // afterEach(() => {
    //   jest.resetAllMocks();
    //   jest.clearAllMocks();
    // });
    it('should return true if currentUserId is in the members array', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
        members: [mockUserId, 3, 11, 654],
      } as Group);

      expect(gm.isMember).toBe(true);
    });

    it('should return false if currentUserId is not in the members array', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
        members: [3, 11, 654],
      } as Group);

      expect(gm.isMember).toBe(false);
    });
  });

  describe('isCurrentUserHasPermissionAddMember', () => {
    beforeEach(() => {
      // (GroupService as any).mockImplementation(() => groupService);
    });
    afterEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });
    it('should return false when user is a member but has not permission', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
        members: [mockUserId],
        permissions: {
          admin: {
            uids: [0],
          },
          user: {
            level: 0,
          },
        },
      } as Group);
      expect(gm.isCurrentUserHasPermissionAddMember).toBe(false);
    });
    it('should return true when user is a member and has permission', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
        members: [mockUserId],
        permissions: {
          admin: {
            uids: [0],
          },
          user: {
            level: PERMISSION_ENUM.TEAM_ADD_MEMBER,
          },
        },
      } as Group);
      expect(gm.isCurrentUserHasPermissionAddMember).toBe(true);
    });
    it('should return false when group info not ready', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        isMocked: true,
      } as Group);
      expect(gm.isCurrentUserHasPermissionAddMember).toBe(false);
    });
  });

  describe('displayName', () => {
    it('should return team name if it is team', () => {
      const gm = GroupModel.fromJS({
        set_abbreviation: 'TEAM NAME',
        is_team: true,
      } as Group);
      expect(gm.displayName).toBe('TEAM NAME');
    });

    it('should return empty string if it is team and no team name', () => {
      const gm = GroupModel.fromJS({
        is_team: true,
      } as Group);
      expect(gm.displayName).toBe('');
    });

    it('should return userDisplayNameForGroupName if it is me conversation', () => {
      const gm = GroupModel.fromJS({
        members: [mockUserId],
      } as Group);
      (getEntity as jest.Mock).mockImplementation((name: string) => {
        if (name === ENTITY_NAME.PERSON) {
          return {
            userDisplayNameForGroupName: 'Chris',
          };
        }
      });
      jest.spyOn(i18next, 't').mockReturnValueOnce('me');
      expect(gm.displayName).toBe('Chris (me)');
    });
  });
});
