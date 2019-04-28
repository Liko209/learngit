import { PERMISSION_ENUM } from '../../constants';
import { groupFactory } from '../../controller/__tests__/factory';
import { GroupActionController } from '../../controller/GroupActionController';
import { GroupController } from '../../controller/GroupController';
import { TeamPermission, TeamPermissionParams } from '../../entity';
import { TeamSetting } from '../../types';
import { GroupService } from '../GroupService';

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
  };
  const mockTeamPermissionController = {
    getTeamUserPermissionFlags: jest.fn(),
  };
  const mockGroupFetchDataController = {
    getTeamUserPermissionFlags: jest.fn(),
    doFuzzySearchAllGroups: jest.fn(),
    doFuzzySearchGroups: jest.fn(),
    doFuzzySearchTeams: jest.fn(),
  };
  const mockHandleDataController = {
    handleData: jest.fn(),
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
      expect(mockFn).toBeCalledWith(mockUserId, mockTeam);
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
      expect(mockFn).toBeCalledWith(mockUserId, mockTeam);
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
      expect(mockFn).toBeCalledWith(mockTeam);
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
      expect(mockJoinTeam).toBeCalledWith(mockUserId, mockTeamId);
    });
  });

  describe('getTeamUserPermissionFlags()', () => {
    it('should call teamActionController with correct parameter', async () => {
      const mockPermission = {};
      await groupService.getTeamUserPermissionFlags(mockPermission);
      expect(
        mockTeamPermissionController.getTeamUserPermissionFlags,
      ).toBeCalledWith(mockPermission);
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
      expect(mockGroupActionController.updateTeamSetting).toBeCalledWith(
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
      expect(mockLeaveTeam).toBeCalledWith(mockUserId, mockTeamId);
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
      expect(mockAddTeamMembers).toBeCalledWith(mockMembers, mockTeamId);
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
      expect(mockRemoveTeamMembers).toBeCalledWith(mockMembers, mockTeamId);
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
      expect(mockIsCurrentUserHasPermission).toBeCalledWith(
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
      expect(mockIsTeamAdmin).toBeCalledWith(mockPersonId, mockPermission);
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
      expect(mockArchiveTeam).toBeCalledWith(mockTeam.id);
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
      expect(makeOrRevokeAdmin).toBeCalledWith(1, 2, true);
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
      expect(pinPost).toBeCalledWith(1, 2, true);
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
      expect(makeOrRevokeAdmin).toBeCalledWith(1, 2, false);
    });
  });

  describe('GroupFetchDataController', () => {
    beforeEach(() => {
      clearMocks();
      setup();
    });

    it('should call getGroupFetchDataController when call doFuzzySearchALlGroups  ', async () => {
      await groupService.doFuzzySearchALlGroups('123', true, false);
      expect(
        mockGroupFetchDataController.doFuzzySearchAllGroups,
      ).toBeCalledWith('123', true, false);
    });

    it('should call getGroupFetchDataController when call doFuzzySearchGroups  ', async () => {
      await groupService.doFuzzySearchGroups('123', true);
      expect(mockGroupFetchDataController.doFuzzySearchGroups).toBeCalledWith(
        '123',
        true,
      );
    });

    it('should call getGroupFetchDataController when call doFuzzySearchTeams  ', async () => {
      await groupService.doFuzzySearchTeams('123', false);
      expect(mockGroupFetchDataController.doFuzzySearchTeams).toBeCalledWith(
        '123',
        false,
      );
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
});
