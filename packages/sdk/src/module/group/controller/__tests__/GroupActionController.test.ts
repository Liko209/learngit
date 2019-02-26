/// <reference path="../../../../__tests__/types.d.ts" />
// import { NetworkManager, OAuthTokenManager } from 'foundation';
import _ from 'lodash';

import { groupFactory } from '../../../../__tests__/factories';
import GroupAPI from '../../../../api/glip/group';
import { daoManager, GroupConfigDao, QUERY_DIRECTION } from '../../../../dao';
import { ERROR_CODES_SERVER, JServerError } from '../../../../error';
import { TestEntityCacheSearchController } from '../../../../framework/__mocks__/controller/TestEntityCacheSearchController';
import { TestEntitySourceController } from '../../../../framework/__mocks__/controller/TestEntitySourceController';
import { TestPartialModifyController } from '../../../../framework/__mocks__/controller/TestPartialModifyController';
import { EntityCacheController } from '../../../../framework/controller/impl/EntityCacheController';
import { IEntityCacheSearchController } from '../../../../framework/controller/interface/IEntityCacheSearchController';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { Raw } from '../../../../framework/model';
import { buildRequestController } from '../../../../framework/controller';
import { AccountGlobalConfig } from '../../../../service/account/config';
import notificationCenter from '../../../../service/notificationCenter';
import { ProfileService } from '../../../profile';
import { PostService } from '../../../post';
import { PersonService } from '../../../person';
import { GroupDao } from '../../dao';
import { Group } from '../../entity';
import { GroupService } from '../../index';
import { TeamSetting } from '../../types';
import { GroupActionController } from '../GroupActionController';
import { TeamPermissionController } from '../TeamPermissionController';
import { IRequestController } from '../../../../framework/controller/interface/IRequestController';
import { DEFAULT_ADMIN_PERMISSION_LEVEL } from '../../constants';
import { PERMISSION_ENUM } from '../../../../service';

jest.mock('../GroupHandleDataController');
jest.mock('../../../../dao');
jest.mock('../../../../framework/controller/impl/EntityPersistentController');
jest.mock('../../../person');
jest.mock('../../dao');
jest.mock('../../../profile');
jest.mock('../../../../service/account/config');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../../../service/company');
jest.mock('../../../post');
jest.mock('sdk/api');
jest.mock('sdk/api/glip/group');
jest.mock('../../../../framework/controller');
class TestRequestController implements IRequestController<Group> {
  get = jest.fn();
  put = jest.fn();
  post = jest.fn();
}
const testRequestController: TestRequestController = new TestRequestController();
buildRequestController.mockReturnValue(testRequestController);

const profileService = new ProfileService();
const personService = new PersonService();
const replaceArray = (value, srcValue) => {
  if (Array.isArray(value)) {
    return srcValue;
  }
};

beforeEach(() => {
  jest.clearAllMocks();

  PersonService.getInstance = jest.fn().mockReturnValue(personService);
  ProfileService.getInstance = jest.fn().mockReturnValue(profileService);
});

describe('GroupFetchDataController', () => {
  let testEntitySourceController: IEntitySourceController<Group>;
  let groupActionController: GroupActionController;
  let testPartialModifyController: IPartialModifyController<Group>;
  let entityCacheController: EntityCacheController;
  let testEntityCacheSearchController: IEntityCacheSearchController<Group>;

  let groupService: GroupService;

  const groupDao = new GroupDao(null);
  const groupConfigDao = new GroupConfigDao(null);
  const postService = new PostService();
  const mockUserId = 1;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    AccountGlobalConfig.getCurrentUserId = jest
      .fn()
      .mockImplementation(() => mockUserId);
    PostService.getInstance = jest.fn().mockReturnValue(postService);

    testEntitySourceController = new TestEntitySourceController<Group>(
      groupFactory,
    );
    testEntitySourceController.get.mockImplementation((id: number) =>
      groupFactory.build({ id }),
    );
    testPartialModifyController = new TestPartialModifyController(
      testEntitySourceController,
    );
    entityCacheController = new EntityCacheController();
    testEntityCacheSearchController = new TestEntityCacheSearchController(
      entityCacheController,
    );
    groupService = new GroupService();
    groupActionController = new GroupActionController(
      groupService,
      testEntitySourceController,
      testPartialModifyController,
      new TeamPermissionController(),
    );
  });

  it('updateGroupPartialData(object) is update success', async () => {
    const result = await groupActionController.updateGroupPartialData({
      id: 1,
      abc: '123',
    });
    expect(result).toEqual(true);
  });

  describe('createTeam()', () => {
    const data = {
      set_abbreviation: 'some team',
      members: [1323],
      description: 'abc',
      privacy: 'private',
      permissions: {
        admin: {
          uids: [1323],
        },
        user: {
          uids: [],
          level: 100,
        },
      },
    };
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it('privacy should be protected if it is public', async () => {
      jest.spyOn(groupActionController, 'handleRawGroup');
      groupActionController.handleRawGroup.mockImplementationOnce(() => {});
      const group: Raw<Group> = _.cloneDeep(data) as Raw<Group>;
      GroupAPI.createTeam.mockResolvedValue(group);
      await groupActionController.createTeam(1323, [], {
        name: 'some team',
        description: 'abc',
        isPublic: true,
      } as TeamSetting);
      expect(GroupAPI.createTeam).toHaveBeenCalledWith(
        Object.assign({}, _.cloneDeep(data), {
          privacy: 'protected',
          permissions: {
            admin: {
              uids: [1323],
            },
            user: {
              uids: [],
              level: 0,
            },
          },
        }),
      );
      expect(groupActionController.handleRawGroup).toHaveBeenCalled();
    });

    it('updateGroupPrivacy({id, privacy}) is update success', async () => {
      const group: Raw<Group> = _.cloneDeep(data) as Raw<Group>;
      GroupAPI.putTeamById.mockResolvedValue(group);
      const result = groupActionController.updateGroupPrivacy({
        id: 1,
        privacy: 'privacy',
      });
      result.then((bool: boolean) => {
        expect(bool).toEqual(true);
      });
    });

    it('data should have correct permission level if passed in options', async () => {
      jest.spyOn(groupActionController, 'handleRawGroup');
      groupActionController.handleRawGroup.mockImplementationOnce(() => {});
      const group: Raw<Group> = _.cloneDeep(data) as Raw<Group>;
      GroupAPI.createTeam.mockResolvedValue(group);
      await groupActionController.createTeam(1323, [], {
        name: 'some team',
        description: 'abc',
        isPublic: true,
        permissionFlags: {
          TEAM_ADD_MEMBER: true,
          TEAM_ADD_INTEGRATIONS: true,
          TEAM_PIN_POST: true,
          TEAM_POST: true,
        },
      } as TeamSetting);
      expect(GroupAPI.createTeam).toHaveBeenCalledWith(
        Object.assign({}, _.cloneDeep(data), {
          privacy: 'protected',
          permissions: {
            admin: {
              uids: [1323],
            },
            user: {
              uids: [],
              level: 1 + 2 + 4 + 8,
            },
          },
        }),
      );
    });

    it('should call dependency apis with correct data', async () => {
      jest.spyOn(groupActionController, 'handleRawGroup');
      groupActionController.handleRawGroup.mockImplementationOnce(() => group);
      const group: Raw<Group> = _.cloneDeep(data) as Raw<Group>;
      GroupAPI.createTeam.mockResolvedValue(group);

      const result = await groupActionController.createTeam(1323, [], {
        name: 'some team',
        description: 'abc',
      });
      expect(result).toEqual(group);

      expect(GroupAPI.createTeam).toHaveBeenCalledWith({
        ...data,
        permissions: {
          ...data.permissions,
          user: {
            uids: data.permissions.user.uids,
            level: 0,
          },
        },
      });
    });

    it('should return error object if duplicate name', async () => {
      const error = new JServerError(
        ERROR_CODES_SERVER.ALREADY_TAKEN,
        'Already taken',
      );
      GroupAPI.createTeam.mockRejectedValue(error);

      await expect(
        groupActionController.createTeam(1323, [], {
          name: 'some team',
          description: 'abc',
        }),
      ).rejects.toEqual(error);
    });
  });

  describe('updateGroupLastAccessedTime', () => {
    it('test', async () => {
      jest.spyOn(groupActionController, 'updateGroupPartialData');
      await groupActionController.updateGroupLastAccessedTime({
        id: 1,
        timestamp: 12345,
      });
      expect(groupActionController.updateGroupPartialData).toHaveBeenCalledWith(
        { id: 1, __last_accessed_at: 12345 },
      );
    });
  });
  describe('removeTeamsByIds()', async () => {
    it('should not do notify', async () => {
      daoManager.getDao.mockReturnValueOnce(groupDao);
      daoManager.getDao.mockReturnValueOnce(groupConfigDao);
      await groupActionController.removeTeamsByIds([1], false);
      expect(groupDao.bulkDelete).toHaveBeenCalledWith([1]);
      expect(notificationCenter.emitEntityDelete).toBeCalledTimes(0);
    });
    it('should to notify', async () => {
      daoManager.getDao.mockReturnValueOnce(groupDao);
      daoManager.getDao.mockReturnValueOnce(groupConfigDao);
      await groupActionController.removeTeamsByIds([1], true);
      expect(groupDao.bulkDelete).toHaveBeenCalledWith([1]);
      expect(notificationCenter.emitEntityDelete).toBeCalledTimes(1);
    });
  });

  describe('handleMarkGroupHasMoreAsTrue', () => {
    it('should do nothing when ids is empty', async () => {
      await groupService.setAsTrue4HasMoreConfigByDirection(
        [],
        QUERY_DIRECTION.OLDER,
      );
      expect(groupConfigDao.bulkUpdate).toHaveBeenCalledTimes(0);
    });
    it('should update group config has_more_older as true', async () => {
      daoManager.getDao.mockReturnValueOnce(groupConfigDao);
      await groupActionController.setAsTrue4HasMoreConfigByDirection(
        [2],
        QUERY_DIRECTION.OLDER,
      );
      expect(groupConfigDao.bulkUpdate).toHaveBeenCalledWith([
        {
          id: 2,
          has_more_older: true,
        },
      ]);
    });
    it('should update group config has_more_newer as true', async () => {
      daoManager.getDao.mockReturnValueOnce(groupConfigDao);
      await groupActionController.setAsTrue4HasMoreConfigByDirection(
        [2],
        QUERY_DIRECTION.NEWER,
      );
      expect(groupConfigDao.bulkUpdate).toHaveBeenCalledWith([
        {
          id: 2,
          has_more_newer: true,
        },
      ]);
    });
  });
  // describe('canJoinTeam()', () => {
  //   it('should return true when team is public', async () => {
  //     const result = await groupActionController.canJoinTeam(
  //       groupFactory.build({
  //         privacy: 'protected',
  //       }),
  //     );
  //     expect(result).toBeTruthy();
  //   });
  //   it('should return false when team is private', async () => {
  //     const result = await groupActionController.canJoinTeam(
  //       groupFactory.build({
  //         privacy: 'privacy',
  //       }),
  //     );
  //     expect(result).toBeFalsy();
  //   });
  // });
  describe('isInTeam()', () => {
    it('should return false when group is_team = false', async () => {
      const userId = 123;
      const group = groupFactory.build({
        is_team: false,
        members: [userId, 3323],
      });
      expect(groupActionController.isInTeam(userId, group)).toBeFalsy();
    });
    it('should return false when userId is not in members', async () => {
      const userId = 123;
      const group = groupFactory.build({
        is_team: false,
        members: [3323],
      });
      expect(groupActionController.isInTeam(userId, group)).toBeFalsy();
    });
    it('should isInTeam return true', async () => {
      const userId = 123;
      const group = groupFactory.build({
        is_team: true,
        members: [userId, 3323],
      });
      expect(groupActionController.isInTeam(userId, group)).toBeTruthy();
    });
  });

  describe('canJoinTeam()', () => {
    it('should not able join a team when privacy=private', async () => {
      const team = groupFactory.build({
        is_team: true,
        privacy: 'private',
      });
      expect(groupActionController.canJoinTeam(team)).toBeFalsy();
    });
    it('should able join a team when privacy=protected', async () => {
      const team = groupFactory.build({
        is_team: true,
        privacy: 'protected',
      });
      expect(groupActionController.canJoinTeam(team)).toBeTruthy();
    });
  });

  describe('joinTeam()', () => {
    it('should call partial modify controller. [JPT-719]', async () => {
      await groupActionController.joinTeam(123, 2);
      expect(testPartialModifyController.updatePartially).toBeCalled();
      expect(testRequestController.put).toBeCalledWith({
        id: 2,
        members: [123],
      });
    });
  });

  describe('leaveTeam()', () => {
    it('should call partial modify controller.', async () => {
      const mockGroup = groupFactory.build({
        id: 2,
        members: [55668833, 540524, 5683],
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockGroup,
      );
      await groupActionController.leaveTeam(5683, 2);
      expect(testPartialModifyController.updatePartially).toBeCalled();
      expect(testRequestController.put).toBeCalledWith({
        id: 2,
        members: [5683],
      });
    });
  });

  describe('addTeamMembers()', () => {
    it('should call partial modify controller.', async () => {
      const mockGroup = groupFactory.build({
        id: 2,
        is_team: true,
        members: [5683, 55668833, 540524],
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockGroup,
      );
      await groupActionController.addTeamMembers([123, 456], 2);
      expect(testPartialModifyController.updatePartially).toBeCalled();
      expect(testRequestController.put).toBeCalledWith({
        id: 2,
        members: [123, 456],
      });
    });
  });

  describe('removeTeamMembers()', () => {
    it('should call partial modify controller.', async () => {
      const mockGroup = groupFactory.build({
        id: 2,
        is_team: true,
        members: [5683, 55668833, 540524],
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockGroup,
      );
      await groupActionController.removeTeamMembers([540524, 5683], 2);
      expect(testPartialModifyController.updatePartially).toBeCalled();
      expect(testRequestController.put).toBeCalledWith({
        id: 2,
        members: [540524, 5683],
      });
    });
  });

  describe('_requestUpdateTeamMembers()', () => {
    it('should call api with correct params. [JPT-719]', async () => {
      // Api.init({}, new NetworkManager(new OAuthTokenManager()));
      await groupActionController['_requestUpdateTeamMembers'](
        2,
        [123],
        '/for_unit_test',
      );

      expect(testRequestController.put).toBeCalledWith({
        id: 2,
        members: [123],
      });
    });
  });

  describe('updateTeamSetting()', () => {
    it('should call requestController.put with correct team info.', async () => {
      const mockTeam = groupFactory.build({
        is_team: true,
        permissions: {
          admin: {
            uids: [1],
            level: DEFAULT_ADMIN_PERMISSION_LEVEL,
          },
          user: {
            uids: [2],
            level: PERMISSION_ENUM.TEAM_POST,
          },
        },
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockTeam,
      );
      await groupActionController.updateTeamSetting(mockTeam.id, {
        name: 'team name',
        description: 'team desc',
        isPublic: true,
        permissionFlags: {
          TEAM_ADD_MEMBER: true,
        },
      });
      expect(testRequestController.put).toBeCalledWith(
        _.mergeWith(
          {},
          mockTeam,
          {
            set_abbreviation: 'team name',
            description: 'team desc',
            privacy: 'protected',
            permissions: {
              user: {
                level:
                  mockTeam.permissions.user.level |
                  PERMISSION_ENUM.TEAM_ADD_MEMBER,
              },
            },
          },
          replaceArray,
        ),
      );
    });
    it('should call requestController.put when permissions change', async () => {
      const mockTeam = groupFactory.build({
        is_team: true,
        permissions: {
          admin: {
            uids: [1],
            level: DEFAULT_ADMIN_PERMISSION_LEVEL,
          },
          user: {
            uids: [2],
            level: PERMISSION_ENUM.TEAM_POST,
          },
        },
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockTeam,
      );
      await groupActionController.updateTeamSetting(mockTeam.id, {
        permissionFlags: {
          TEAM_ADD_MEMBER: true,
        },
      });
      expect(testRequestController.put).toBeCalledWith(
        _.mergeWith(
          {},
          mockTeam,
          {
            permissions: {
              user: {
                level:
                  mockTeam.permissions.user.level |
                  PERMISSION_ENUM.TEAM_ADD_MEMBER,
              },
            },
          },
          replaceArray,
        ),
      );
    });
  });

  describe('makeAdmin()', () => {
    it('should add user to permissions.admin.uids when permission not exist', async () => {
      const mockTeam = groupFactory.build({
        members: [1, 2, 3],
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockTeam,
      );
      await groupActionController.makeOrRevokeAdmin(mockTeam.id, 2, true);
      expect(testRequestController.put).toBeCalledWith(
        _.mergeWith(
          {},
          mockTeam,
          {
            permissions: {
              admin: {
                uids: [2],
              },
            },
          },
          replaceArray,
        ),
      );
    });
    it('should add user to permissions.admin.uids with old admin.uids', async () => {
      const mockTeam = groupFactory.build({
        members: [1, 2, 3],
        permissions: {
          admin: {
            uids: [1],
          },
        },
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockTeam,
      );
      await groupActionController.makeOrRevokeAdmin(mockTeam.id, 2, true);
      expect(testRequestController.put).toBeCalledWith(
        _.mergeWith(
          {},
          mockTeam,
          {
            permissions: {
              admin: {
                uids: [1, 2],
              },
            },
          },
          replaceArray,
        ),
      );
    });
    it('should not add user to permissions.admin.uids duplicate', async () => {
      const mockTeam = groupFactory.build({
        members: [1, 2, 3],
        permissions: {
          admin: {
            uids: [1, 2],
          },
        },
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockTeam,
      );
      await groupActionController.makeOrRevokeAdmin(mockTeam.id, 2, true);
      expect(testRequestController.put).not.toBeCalled();
    });
  });
  describe('revokeAdmin()', () => {
    it('should not broken when permissions not exist', async () => {
      const mockTeam = groupFactory.build({
        members: [1, 2, 3],
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockTeam,
      );
      await groupActionController.makeOrRevokeAdmin(mockTeam.id, 2, false);
      expect(testRequestController.put).toBeCalledWith(
        _.mergeWith(
          {},
          mockTeam,
          {
            permissions: {
              admin: {
                uids: [],
              },
            },
          },
          replaceArray,
        ),
      );
    });
    it('should remove user from permissions.admin.uids', async () => {
      const mockTeam = groupFactory.build({
        members: [1, 2, 3],
        permissions: {
          admin: {
            uids: [1, 2],
          },
        },
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockTeam,
      );
      await groupActionController.makeOrRevokeAdmin(mockTeam.id, 2, false);
      expect(testRequestController.put).toBeCalledWith(
        _.mergeWith(
          {},
          mockTeam,
          {
            permissions: {
              admin: {
                uids: [1],
              },
            },
          },
          replaceArray,
        ),
      );
    });
    it('should not call api when remove admin areadly not in admin.uids', async () => {
      const mockTeam = groupFactory.build({
        members: [1, 2, 3],
        permissions: {
          admin: {
            uids: [1],
          },
        },
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockTeam,
      );
      await groupActionController.makeOrRevokeAdmin(mockTeam.id, 2, false);
      expect(testRequestController.put).not.toBeCalled();
    });
  });

  describe('archiveTeam()', () => {
    it('should call requestController.put with correct team info.', async () => {
      const mockTeam = groupFactory.build({
        is_team: true,
        is_archived: false,
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockTeam,
      );
      await groupActionController.archiveTeam(mockTeam.id);
      expect(testRequestController.put).toBeCalledWith(
        _.merge({}, mockTeam, {
          is_archived: true,
        }),
      );
    });
  });

  describe('deleteTeam()', () => {
    it('should call requestController.put with correct team info.', async () => {
      const mockTeam = groupFactory.build({
        is_team: true,
        deactivated: false,
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockTeam,
      );
      await groupActionController.deleteTeam(mockTeam.id);
      expect(testRequestController.put).toBeCalledWith(
        _.merge({}, mockTeam, {
          deactivated: true,
        }),
      );
    });
  });
});
