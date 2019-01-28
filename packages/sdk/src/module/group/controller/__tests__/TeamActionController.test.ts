/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:32:43
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { NetworkManager, OAuthTokenManager } from 'foundation';
import { Api } from '../../../../api';
import { IEntitySourceController } from '../../../../framework/controller/interface/IEntitySourceController';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { IRequestController } from '../../../../framework/controller/interface/IRequestController';
import { PartialModifyController } from '../../../../framework/controller/impl/PartialModifyController';
import {
  buildRequestController,
  buildPartialModifyController,
} from '../../../../framework/controller';
import { Raw } from '../../../../framework/model';
import { PERMISSION_ENUM } from '../../../../service';
import { DEFAULT_ADMIN_PERMISSION_LEVEL } from '../../constants';
import { Group } from '../../entity/Group';
import { TeamActionController } from '../TeamActionController';
import { TeamPermissionController } from '../TeamPermissionController';
import { groupFactory } from './factory';
jest.mock('../../../../api');
const delegate = (
  getObject: Function,
  methodName: string,
  isAsync: boolean = true,
) => {
  return isAsync
    ? jest.fn().mockImplementation(async (...args) => {
      const object = getObject();
      return await object[methodName].call(object, ...args);
    })
    : jest.fn().mockImplementation((...args) => {
      const object = getObject();
      return object[methodName].call(object, ...args);
    });
};

class TestEntitySourceController implements IEntitySourceController<Group> {
  get = jest.fn().mockImplementation(async (id: number) => {
    return groupFactory.build({
      id,
    });
  });

  getEntityLocally = jest.fn();

  getEntitiesLocally = jest.fn();

  getEntityNotificationKey = jest.fn().mockReturnValue([]);

  put = jest.fn();

  bulkPut = jest.fn();

  clear = jest.fn();

  delete = jest.fn();

  bulkDelete = jest.fn();

  update = jest.fn();

  bulkUpdate = jest.fn();

  batchGet = jest.fn().mockResolvedValue([]);
}

jest.mock('../../../../framework/controller');

class TestPartialModifyController implements IPartialModifyController<Group> {
  public partialModifyController: IPartialModifyController<Group>;
  constructor(public entitySourceController: IEntitySourceController<Group>) {
    this.partialModifyController = new PartialModifyController(
      entitySourceController,
    );
  }
  updatePartially = jest
    .fn()
    .mockImplementation(
      async (
        entityId: number,
        preHandlePartialEntity: (
          partialEntity: Partial<Raw<Group>>,
          originalEntity: Group,
        ) => Partial<Raw<Group>>,
        doUpdateEntity: (updatedEntity: Group) => Promise<Group>,
      ) => {
        const originalEntity: Group = await this.entitySourceController.get(
          entityId,
        );
        let partialEntity: Partial<Group> = {
          id: entityId,
          _id: entityId,
        };
        partialEntity = preHandlePartialEntity
          ? preHandlePartialEntity(partialEntity, originalEntity)
          : partialEntity;
        const mergeEntity = this.partialModifyController.getMergedEntity(
          partialEntity,
          originalEntity,
        );
        doUpdateEntity && (await doUpdateEntity(mergeEntity));
        return mergeEntity;
      },
    );
  getMergedEntity = delegate(
    () => this.partialModifyController,
    'getMergedEntity',
    false,
  );
  getRollbackPartialEntity = delegate(
    () => this.partialModifyController,
    'getRollbackPartialEntity',
    false,
  );
}

class TestRequestController implements IRequestController<Group> {
  get = jest.fn();
  put = jest.fn();
  post = jest.fn();
}

describe('TeamController', () => {
  let testEntitySourceController: IEntitySourceController<Group>;
  let teamActionController: TeamActionController;
  let testPartialModifyController: IPartialModifyController<Group>;
  let testRequestController: TestRequestController;
  beforeEach(() => {
    testEntitySourceController = new TestEntitySourceController();
    testPartialModifyController = new TestPartialModifyController(
      testEntitySourceController,
    );
    testPartialModifyController = new TestPartialModifyController(
      testEntitySourceController,
    );
    testRequestController = new TestRequestController();

    buildRequestController.mockImplementation(() => {
      return testRequestController;
    });

    buildPartialModifyController.mockImplementation(() => {
      return testPartialModifyController;
    });

    teamActionController = new TeamActionController(
      testPartialModifyController,
      testEntitySourceController,
      new TeamPermissionController(),
    );
  });

  describe('isInTeam()', () => {
    it('should return false when group is_team = false', async () => {
      const userId = 123;
      const group = groupFactory.build({
        is_team: false,
        members: [userId, 3323],
      });
      expect(teamActionController.isInTeam(userId, group)).toBeFalsy();
    });
    it('should return false when userId is not in members', async () => {
      const userId = 123;
      const group = groupFactory.build({
        is_team: false,
        members: [3323],
      });
      expect(teamActionController.isInTeam(userId, group)).toBeFalsy();
    });
    it('should isInTeam return true', async () => {
      const userId = 123;
      const group = groupFactory.build({
        is_team: true,
        members: [userId, 3323],
      });
      expect(teamActionController.isInTeam(userId, group)).toBeTruthy();
    });
  });

  describe('canJoinTeam()', () => {
    it('should not able join a team when privacy=private', async () => {
      const team = groupFactory.build({
        is_team: true,
        privacy: 'private',
      });
      expect(teamActionController.canJoinTeam(team)).toBeFalsy();
    });
    it('should able join a team when privacy=protected', async () => {
      const team = groupFactory.build({
        is_team: true,
        privacy: 'protected',
      });
      expect(teamActionController.canJoinTeam(team)).toBeTruthy();
    });
  });

  describe('joinTeam()', () => {
    it('should call partial modify controller. [JPT-719]', async () => {
      await teamActionController.joinTeam(123, 2);
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
      await teamActionController.leaveTeam(5683, 2);
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
      const result = await teamActionController.addTeamMembers([123, 456], 2);
      expect(testPartialModifyController.updatePartially).toBeCalled();
      expect(result).toEqual({
        ...mockGroup,
        _id: 2,
        members: [5683, 55668833, 540524, 123, 456],
      });
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
      const result = await teamActionController.removeTeamMembers(
        [540524, 5683],
        2,
      );
      expect(testPartialModifyController.updatePartially).toBeCalled();
      expect(testRequestController.put).toBeCalledWith({
        id: 2,
        members: [540524, 5683],
      });
      expect(result).toEqual({
        ...mockGroup,
        _id: 2,
        members: [55668833],
      });
    });
  });

  describe('_requestUpdateTeamMembers()', () => {
    it('should call api with correct params. [JPT-719]', async () => {
      Api.init({}, new NetworkManager(new OAuthTokenManager()));
      await teamActionController['_requestUpdateTeamMembers'](
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
      await teamActionController.updateTeamSetting(mockTeam.id, {
        name: 'team name',
        description: 'team desc',
        isPublic: true,
        permissionFlags: {
          TEAM_ADD_MEMBER: true,
        },
      });
      expect(testRequestController.put).toBeCalledWith(
        _.merge({}, mockTeam, {
          _id: mockTeam.id,
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
        }),
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
      await teamActionController.updateTeamSetting(mockTeam.id, {
        permissionFlags: {
          TEAM_ADD_MEMBER: true,
        },
      });
      expect(testRequestController.put).toBeCalledWith(
        _.merge({}, mockTeam, {
          _id: mockTeam.id,
          permissions: {
            user: {
              level:
                mockTeam.permissions.user.level |
                PERMISSION_ENUM.TEAM_ADD_MEMBER,
            },
          },
        }),
      );
    });
  });
  describe('deleteTeam()', () => {
    it('should call requestController.put with correct team info.', async () => {
      const mockTeam = groupFactory.build({
        deactivated: false,
      });
      (testEntitySourceController.get as jest.Mock).mockResolvedValueOnce(
        mockTeam,
      );
      await teamActionController.deleteTeam(mockTeam.id);
      expect(testRequestController.put).toBeCalledWith(
        _.merge({}, mockTeam, {
          _id: mockTeam.id,
          deactivated: true,
        }),
      );
    });
  });
});
