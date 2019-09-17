import { PERMISSION_ENUM } from '../../constants';
import { groupFactory } from '../../controller/__tests__/factory';
import { GroupActionController } from '../../controller/GroupActionController';
import { GroupController } from '../../controller/GroupController';
import { TeamPermission, TeamPermissionParams, Group } from '../../entity';
import { TeamSetting } from '../../types';
import { GroupService } from '../GroupService';
import { GROUP_QUERY_TYPE } from 'sdk/service';

jest.mock('../../controller/GroupActionController', () => ({
  GroupActionController: jest.fn(),
}));
jest.mock('../../controller/GroupController', () => ({
  GroupController: jest.fn(),
}));
jest.mock('../../controller/GroupActionController');
jest.mock('sdk/api');
jest.mock('sdk/dao');

describe('GroupService', () => {
  let groupService: GroupService;
  const mockGroupActionController = {
    joinTeam: jest.fn(),
    canJoinTeam: jest.fn(),
    getTeamSetting: jest.fn(),
    updateTeamSetting: jest.fn(),
    createTeam: jest.fn(),
    convertToTeam: jest.fn(),
    updateGroupPrivacy: jest.fn(),
    isGroupCanBeShown: jest.fn(),
    updateGroupLastAccessedTime: jest.fn(),
  };
  const mockTeamPermissionController = {
    getTeamUserPermissionFlags: jest.fn(),
  };
  const mockGroupFetchDataController = {
    getTeamUserPermissionFlags: jest.fn(),
    doFuzzySearchAllGroups: jest.fn(),
    doFuzzySearchGroups: jest.fn(),
    doFuzzySearchTeams: jest.fn(),
    getGroupsByType: jest.fn(),
    getGroupsByIds: jest.fn(),
    getPersonIdsBySelectedItem: jest.fn(),
    getLocalGroup: jest.fn(),
    getOrCreateGroupByMemberList: jest.fn(),
    isFavored: jest.fn(),
    getGroupEmail: jest.fn(),
    getGroupName: jest.fn(),
    getMemberAndGuestIds: jest.fn(),
  };
  const mockHandleDataController = {
    handleData: jest.fn(),
    handleGroupFetchedPost: jest.fn(),
  };
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  function setup() {
    (GroupController as any).mockImplementation(() => {
      return {
        getGroupActionController: jest
          .fn()
          .mockReturnValue(mockGroupActionController),
        getTeamPermissionController: jest
          .fn()
          .mockReturnValue(mockTeamPermissionController),
        getGroupFetchDataController: jest
          .fn()
          .mockReturnValue(mockGroupFetchDataController),
        getHandleDataController: jest
          .fn()
          .mockReturnValue(mockHandleDataController),
      };
    });
    (GroupActionController as any).mockImplementation(() => {
      return mockGroupActionController;
    });
    groupService = new GroupService();
  }

  beforeEach(() => {
    clearMocks();
    setup();
  });

  describe('isInTeam()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call with correct params', async () => {
      const mockUserId = 13213;
      const mockTeam = groupFactory.build();
      const mockFn = jest.fn();
      groupService['getGroupController']();
      groupService.groupController.getGroupActionController = jest
        .fn()
        .mockReturnValue({
          isInTeam: mockFn,
        });
      await groupService.isInTeam(mockUserId, mockTeam);
      expect(mockFn).toHaveBeenCalledWith(mockUserId, mockTeam);
    });
  });

  describe('isInTeam()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call with correct params', async () => {
      const mockUserId = 13213;
      const mockTeam = groupFactory.build();
      const mockFn = jest.fn();
      groupService['getGroupController']();
      groupService.groupController.getGroupActionController = jest
        .fn()
        .mockReturnValue({
          isInGroup: mockFn,
        });
      await groupService.isInGroup(mockUserId, mockTeam);
      expect(mockFn).toHaveBeenCalledWith(mockUserId, mockTeam);
    });
  });
  describe('canJoinTeam()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call with correct params', async () => {
      const mockTeam = groupFactory.build();
      const mockFn = jest.fn();
      groupService['getGroupController']();
      groupService.groupController.getGroupActionController = jest
        .fn()
        .mockReturnValue({
          canJoinTeam: mockFn,
        });
      await groupService.canJoinTeam(mockTeam);
      expect(mockFn).toHaveBeenCalledWith(mockTeam);
    });
  });
  describe('joinTeam()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call with correct params', async () => {
      const mockUserId = 13213;
      const mockTeamId = 44213;
      const mockJoinTeam = jest.fn();
      groupService['getGroupController']();
      groupService.groupController.getGroupActionController = jest
        .fn()
        .mockReturnValue({
          joinTeam: mockJoinTeam,
        });
      await groupService.joinTeam(mockUserId, mockTeamId);
      expect(mockJoinTeam).toHaveBeenCalledWith(mockUserId, mockTeamId);
    });
  });

  describe('getTeamUserPermissionFlags()', () => {
    it('should call teamActionController with correct parameter', async () => {
      const mockPermission = {};
      await groupService.getTeamUserPermissionFlags(mockPermission);
      expect(
        mockTeamPermissionController.getTeamUserPermissionFlags,
      ).toHaveBeenCalledWith(mockPermission);
    });
  });

  describe('updateTeamSetting()', () => {
    it('should call teamActionController with correct parameter', async () => {
      const mockTeamId = 123;
      const mockTeamSetting: TeamSetting = {
        name: 'test team',
        description: 'this is a team',
        isPublic: true,
        permissionFlags: {
          TEAM_POST: true,
          TEAM_ADD_MEMBER: true,
        },
      };
      await groupService.updateTeamSetting(mockTeamId, mockTeamSetting);
      expect(mockGroupActionController.updateTeamSetting).toHaveBeenCalledWith(
        mockTeamId,
        mockTeamSetting,
      );
    });
  });
  describe('leaveTeam()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call with correct params', async () => {
      const mockUserId = 5683;
      const mockTeamId = 55668833;
      const mockLeaveTeam = jest.fn();
      groupService['getGroupController']();
      groupService.groupController.getGroupActionController = jest
        .fn()
        .mockReturnValue({
          leaveTeam: mockLeaveTeam,
        });
      await groupService.leaveTeam(mockUserId, mockTeamId);
      expect(mockLeaveTeam).toHaveBeenCalledWith(mockUserId, mockTeamId);
    });
  });
  describe('addTeamMembers()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call with correct params', async () => {
      const mockMembers = [5683, 56833];
      const mockTeamId = 55668833;
      const mockAddTeamMembers = jest.fn();
      groupService['getGroupController']();
      groupService.groupController.getGroupActionController = jest
        .fn()
        .mockReturnValue({
          addTeamMembers: mockAddTeamMembers,
        });
      await groupService.addTeamMembers(mockMembers, mockTeamId);
      expect(mockAddTeamMembers).toHaveBeenCalledWith(mockMembers, mockTeamId);
    });
  });
  describe('removeTeamMembers()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call with correct params', async () => {
      const mockMembers = [5683, 56833];
      const mockTeamId = 55668833;
      const mockRemoveTeamMembers = jest.fn();
      groupService['getGroupController']();
      groupService.groupController.getGroupActionController = jest
        .fn()
        .mockReturnValue({
          removeTeamMembers: mockRemoveTeamMembers,
        });
      await groupService.removeTeamMembers(mockMembers, mockTeamId);
      expect(mockRemoveTeamMembers).toHaveBeenCalledWith(
        mockMembers,
        mockTeamId,
      );
    });
  });
  describe('isCurrentUserHasPermission()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call with correct params', async () => {
      const mockParams: TeamPermissionParams = {
        members: [],
      };
      const mockPermissionType = PERMISSION_ENUM.TEAM_ADD_MEMBER;
      const mockIsCurrentUserHasPermission = jest.fn();
      groupService['getGroupController']();
      groupService.groupController.getTeamPermissionController = jest
        .fn()
        .mockReturnValue({
          isCurrentUserHasPermission: mockIsCurrentUserHasPermission,
        });
      await groupService.isCurrentUserHasPermission(
        mockPermissionType,
        mockParams,
      );
      expect(mockIsCurrentUserHasPermission).toHaveBeenCalledWith(
        mockPermissionType,
        mockParams,
      );
    });
  });
  describe('isTeamAdmin()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call with correct params', async () => {
      const mockPersonId = 5683;
      const mockPermission: TeamPermission = {};
      const mockIsTeamAdmin = jest.fn();
      groupService['getGroupController']();
      groupService.groupController.getTeamPermissionController = jest
        .fn()
        .mockReturnValue({
          isTeamAdmin: mockIsTeamAdmin,
        });
      groupService.isTeamAdmin(mockPersonId, mockPermission);
      expect(mockIsTeamAdmin).toHaveBeenCalledWith(
        mockPersonId,
        mockPermission,
      );
    });
  });
  describe('archiveTeam()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call with correct params', async () => {
      const mockTeam = groupFactory.build({
        is_team: true,
      });
      const mockArchiveTeam = jest.fn();
      groupService['getGroupController']();
      groupService.groupController.getGroupActionController = jest
        .fn()
        .mockReturnValue({
          archiveTeam: mockArchiveTeam,
        });
      await groupService.archiveTeam(mockTeam.id);
      expect(mockArchiveTeam).toHaveBeenCalledWith(mockTeam.id);
    });
  });

  describe('makeAdmin()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call with correct params', async () => {
      const makeOrRevokeAdmin = jest.fn();
      groupService['getGroupController']();
      groupService.groupController.getGroupActionController = jest
        .fn()
        .mockReturnValue({
          makeOrRevokeAdmin,
        });
      await groupService.makeAdmin(1, 2);
      expect(makeOrRevokeAdmin).toHaveBeenCalledWith(1, 2, true);
    });
  });

  describe('pinPost', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call group action controller to pin a post', async () => {
      const pinPost = jest.fn();
      groupService['getGroupController']();
      groupService.groupController.getGroupActionController = jest
        .fn()
        .mockReturnValue({
          pinPost,
        });
      await groupService.pinPost(1, 2, true);
      expect(pinPost).toHaveBeenCalledWith(1, 2, true);
    });
  });

  describe('revokeAdmin()', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call with correct params', async () => {
      const makeOrRevokeAdmin = jest.fn();
      groupService['getGroupController']();
      groupService.groupController.getGroupActionController = jest
        .fn()
        .mockReturnValue({
          makeOrRevokeAdmin,
        });
      await groupService.revokeAdmin(1, 2);
      expect(makeOrRevokeAdmin).toHaveBeenCalledWith(1, 2, false);
    });
  });

  describe('GroupFetchDataController', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call getGroupFetchDataController when call doFuzzySearchALlGroups  ', async () => {
      const option = {
        fetchAllIfSearchKeyEmpty: true,
        myGroupsOnly: false,
        recentFirst: true,
      };

      await groupService.doFuzzySearchAllGroups('123', option);
      expect(
        mockGroupFetchDataController.doFuzzySearchAllGroups,
      ).toHaveBeenCalledWith('123', option);
    });

    it('should call getGroupFetchDataController when call doFuzzySearchGroups  ', async () => {
      await groupService.doFuzzySearchGroups('123', true, true);
      expect(
        mockGroupFetchDataController.doFuzzySearchGroups,
      ).toHaveBeenCalledWith('123', true, true);
    });

    it('should call getGroupFetchDataController when call doFuzzySearchTeams  ', async () => {
      await groupService.doFuzzySearchTeams('123', false);
      expect(
        mockGroupFetchDataController.doFuzzySearchTeams,
      ).toHaveBeenCalledWith('123', false, undefined);
    });

    it('should call getGroupFetchDataController when call getGroupsByType', async () => {
      await groupService.getGroupsByType(GROUP_QUERY_TYPE.ALL, 1, 1, 20);
      expect(mockGroupFetchDataController.getGroupsByType).toHaveBeenCalledWith(
        GROUP_QUERY_TYPE.ALL,
        1,
        1,
        20,
      );
    });

    it('should call getGroupFetchDataController when call getGroupsByIds', async () => {
      await groupService.getGroupsByIds([1], true);
      expect(mockGroupFetchDataController.getGroupsByIds).toHaveBeenCalledWith(
        [1],
        true,
      );
    });
    it('should call getGroupFetchDataController when call getPersonIdsBySelectedItem', async () => {
      await groupService.getPersonIdsBySelectedItem([1]);
      expect(
        mockGroupFetchDataController.getPersonIdsBySelectedItem,
      ).toHaveBeenCalledWith([1]);
    });
    it('should call getGroupFetchDataController when call getLocalGroup', async () => {
      await groupService.getLocalGroup([1]);
      expect(mockGroupFetchDataController.getLocalGroup).toHaveBeenCalledWith([
        1,
      ]);
    });
    it('should call getGroupFetchDataController when call getOrCreateGroupByMemberList', async () => {
      await groupService.getOrCreateGroupByMemberList([1]);
      expect(
        mockGroupFetchDataController.getOrCreateGroupByMemberList,
      ).toHaveBeenCalledWith([1]);
    });
    it('should call getGroupFetchDataController when call isFavored', async () => {
      await groupService.isFavored(1, 1);
      expect(mockGroupFetchDataController.isFavored).toHaveBeenCalledWith(1, 1);
    });
    it('should call getGroupFetchDataController when call isFavored', async () => {
      await groupService.getGroupEmail(1);
      expect(mockGroupFetchDataController.getGroupEmail).toHaveBeenCalledWith(
        1,
      );
    });

    it('should call getGroupFetchDataController when call getMembersAndGuestIds  ', async () => {
      await groupService.getMemberAndGuestIds(123, 40, 10, true);
      expect(
        mockGroupFetchDataController.getMemberAndGuestIds,
      ).toHaveBeenCalledWith(123, 40, 10, true);
    });
  });

  describe('GroupController', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call with right parameters', async () => {
      await groupService.handleGroupFetchedPosts(1, []);
      expect(
        mockHandleDataController.handleGroupFetchedPost,
      ).toHaveBeenCalledWith(1, []);
    });
  });

  describe('getById', () => {
    it('should receive null when id is not correct group id', async () => {
      try {
        await groupService.getById(1);
      } catch (e) {
        expect(e).toBeNull();
      }
    });
  });

  describe('isValid', () => {
    const baseGroup = {
      id: 1,
      deactivated: false,
      members: [1, 2],
      set_abbreviation: 'g',
      is_archived: false,
    };

    it.each`
      group                                   | isSMSGroup | res
      ${{ ...baseGroup }}                     | ${false}    | ${true}
      ${{ ...baseGroup }}                     | ${true}    | ${false}
      ${{ ...baseGroup, is_archived: true }}  | ${false}   | ${false}
      ${{ ...baseGroup, deactivated: true }}  | ${false}   | ${false}
      ${{ ...baseGroup, members: undefined }} | ${false}   | ${false}
    `(
      'should return $res for $group and isSMSGroup: $isSMSGroup',
      ({ group, res, isSMSGroup }) => {
        groupService.isSMSGroup = jest.fn().mockReturnValue(isSMSGroup);

        expect(groupService.isValid(group)).toEqual(res);
      },
    );
  });

  describe('getGroupName', () => {
    it('should call getGroupName with correct parameter', () => {
      const group = {
        id: 1,
        members: [1, 2],
      };
      groupService.getGroupName(group as Group);
      expect(mockGroupFetchDataController.getGroupName).toHaveBeenCalledWith(
        group,
      );
    });
  });

  describe('GroupActionController', () => {
    it('should call with right parameters', async () => {
      await groupService.createTeam(1, [1, 2], {});
      expect(mockGroupActionController.createTeam).toHaveBeenCalledWith(
        1,
        [1, 2],
        {},
      );
    });
    it('should call with right parameters', async () => {
      await groupService.convertToTeam(1, [1, 2], {});
      expect(mockGroupActionController.convertToTeam).toHaveBeenCalledWith(
        1,
        [1, 2],
        {},
      );
    });
    it('should call with right parameters', async () => {
      await groupService.updateGroupPrivacy({ id: 1, privacy: '1' });
      expect(mockGroupActionController.updateGroupPrivacy).toHaveBeenCalledWith(
        {
          id: 1,
          privacy: '1',
        },
      );
    });
    it('should call with right parameters', async () => {
      await groupService.isGroupCanBeShown(1);
      expect(mockGroupActionController.isGroupCanBeShown).toHaveBeenCalledWith(
        1,
      );
    });
    it('should call with right parameters', async () => {
      await groupService.updateGroupLastAccessedTime({ id: 1, timestamp: 1 });
      expect(
        mockGroupActionController.updateGroupLastAccessedTime,
      ).toHaveBeenCalledWith({ id: 1, timestamp: 1 });
    });
  });
});
