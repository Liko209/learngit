import { GroupService } from '../GroupService';
import { PERMISSION_ENUM } from '../../constants';
import { groupFactory } from '../../controller/__tests__/factory';
import { TeamController } from '../../controller/TeamController';
import { TeamActionController } from '../../controller/TeamActionController';
import { TeamSetting } from '../../types';

jest.mock('../../controller/TeamActionController', () => ({
  TeamActionController: jest.fn(),
}));
jest.mock('../../controller/TeamController', () => ({
  TeamController: jest.fn(),
}));
import { TeamPermission } from '../../entity';

jest.mock('../../controller/TeamActionController');
jest.mock('sdk/api');
jest.mock('sdk/dao');

describe('GroupService', () => {
  let groupService: GroupService;
  const mockTeamActionController = {
    joinTeam: jest.fn(),
    canJoinTeam: jest.fn(),
    getTeamSetting: jest.fn(),
    updateTeamSetting: jest.fn(),
  };
  function clearMocks() {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  }

  function setup() {
    groupService = new GroupService();
    (TeamController as any).mockImplementation(() => {
      return {
        getTeamActionController: jest
          .fn()
          .mockReturnValue(mockTeamActionController),
      };
    });
    (TeamActionController as any).mockImplementation(() => {
      return mockTeamActionController;
    });
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
      groupService['getTeamController']();
      groupService.teamController.getTeamActionController = jest
        .fn()
        .mockReturnValue({
          isInTeam: mockFn,
        });
      await groupService.isInTeam(mockUserId, mockTeam);
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
      groupService['getTeamController']();
      groupService.teamController.getTeamActionController = jest
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
      groupService['getTeamController']();
      groupService.teamController.getTeamActionController = jest
        .fn()
        .mockReturnValue({
          joinTeam: mockJoinTeam,
        });
      await groupService.joinTeam(mockUserId, mockTeamId);
      expect(mockJoinTeam).toBeCalledWith(mockUserId, mockTeamId);
    });
  });

  describe('getTeamSetting()', () => {
    it('should call teamActionController with correct parameter', async () => {
      const mockTeamId = 123;
      await groupService.getTeamSetting(mockTeamId);
      expect(mockTeamActionController.getTeamSetting).toBeCalledWith(
        mockTeamId,
      );
    });
  });

  describe('updateTeamSetting()', () => {
    it('should call teamActionController with correct parameter', async () => {
      const mockTeamId = 123;
      const mockTeamSetting: TeamSetting = {
        name: 'test team',
        description: 'this is a team',
        isPublic: true,
        permissionMap: {
          [PERMISSION_ENUM.TEAM_POST]: true,
          [PERMISSION_ENUM.TEAM_ADD_MEMBER]: true,
        },
      };
      await groupService.updateTeamSetting(mockTeamId, mockTeamSetting);
      expect(mockTeamActionController.updateTeamSetting).toBeCalledWith(
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
      groupService['getTeamController']();
      groupService.teamController.getTeamActionController = jest
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
      groupService['getTeamController']();
      groupService.teamController.getTeamActionController = jest
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
      groupService['getTeamController']();
      groupService.teamController.getTeamActionController = jest
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
      const mockTeam = groupFactory.build();
      const mockPermissionType = PERMISSION_ENUM.TEAM_ADD_MEMBER;
      const mockIsCurrentUserHasPermission = jest.fn();
      groupService['getTeamController']();
      groupService.teamController.getTeamPermissionController = jest
        .fn()
        .mockReturnValue({
          isCurrentUserHasPermission: mockIsCurrentUserHasPermission,
        });
      groupService.isCurrentUserHasPermission(mockTeam, mockPermissionType);
      expect(mockIsCurrentUserHasPermission).toBeCalledWith(
        mockTeam,
        mockPermissionType,
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
      groupService['getTeamController']();
      groupService.teamController.getTeamPermissionController = jest
        .fn()
        .mockReturnValue({
          isTeamAdmin: mockIsTeamAdmin,
        });
      groupService.isTeamAdmin(mockPersonId, mockPermission);
      expect(mockIsTeamAdmin).toBeCalledWith(mockPersonId, mockPermission);
    });
  });
});
