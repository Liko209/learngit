/// <reference path="../../../../__tests__/types.d.ts" />
import { BaseResponse } from 'foundation';
import _ from 'lodash';

import { groupFactory } from '../../../../__tests__/factories';
import { ApiResultErr, ApiResultOk } from '../../../../api/ApiResult';
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
import { UserConfig } from '../../../../service/account/UserConfig';
import notificationCenter from '../../../../service/notificationCenter';
import PostService from '../../../../service/post';
import ProfileService from '../../../../service/profile';
import { PersonService } from '../../../person';
import { GroupDao } from '../../dao';
import { Group } from '../../entity';
import { GroupService } from '../../index';
import { TeamSetting } from '../../types';
import { GroupActionController } from '../GroupActionController';
import { TeamPermissionController } from '../TeamPermissionController';

jest.mock('../GroupHandleDataController');
jest.mock('../../../../dao');
jest.mock('../../../../framework/controller/impl/EntityPersistentController');
jest.mock('../../../person');
jest.mock('../../dao');
jest.mock('../../../../service/profile');
jest.mock('../../../../service/account/UserConfig');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../../../service/company');
jest.mock('../../../../service/post');
jest.mock('sdk/api');
jest.mock('sdk/api/glip/group');

const profileService = new ProfileService();
const personService = new PersonService();
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
    UserConfig.getCurrentUserId = jest
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
      GroupAPI.createTeam.mockResolvedValue(
        new ApiResultOk(group, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );
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
      GroupAPI.putTeamById.mockResolvedValue(
        new ApiResultOk(group, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );
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
      GroupAPI.createTeam.mockResolvedValue(
        new ApiResultOk(group, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );
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
      GroupAPI.createTeam.mockResolvedValue(
        new ApiResultOk(group, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );

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
      GroupAPI.createTeam.mockResolvedValue(
        new ApiResultErr(error, {
          status: 403,
          headers: {},
        } as BaseResponse),
      );

      expect(
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
});
