import { GroupService } from '../GroupService';
import { groupFactory } from '../../controller/__tests__/factory';
import { TeamController } from '../../controller/TeamController';
import { TeamActionController } from '../../controller/TeamActionController';
import { TeamSetting } from '../../types';
import { PERMISSION_ENUM } from '../../../../service/constants';

jest.mock('../../controller/TeamActionController', () => ({
  TeamActionController: jest.fn(),
}));
jest.mock('../../controller/TeamController', () => ({
  TeamController: jest.fn(),
}));

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
});
