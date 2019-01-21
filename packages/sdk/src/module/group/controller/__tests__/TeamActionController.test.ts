/*
 * @Author: Paynter Chen
 * @Date: 2019-01-02 09:32:43
 * Copyright © RingCentral. All rights reserved.
 */

import { TeamActionController } from '../TeamActionController';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { Group } from '../../entity/Group';
import { IRequestController } from '../../../../framework/controller/interface/IRequestController';
import { groupFactory } from './factory';
import {
  buildRequestController,
  buildPartialModifyController,
} from '../../../../framework/controller';
import { Api } from '../../../../api';
import { NetworkManager, OAuthTokenManager } from 'foundation/src';
import { Raw } from '../../../../framework/model';

jest.mock('../../../../framework/controller');

class TestPartialModifyController implements IPartialModifyController<Group> {
  updatePartially = jest.fn(
    (
      entityId: number,
      preHandlePartialEntity: (
        partialEntity: Partial<Raw<Group>>,
        originalEntity: Group,
      ) => Partial<Raw<Group>>,
      doUpdateEntity: (updatedEntity: Group) => Promise<Group>,
    ) => {
      const originalEntity: Group = groupFactory.build({
        is_team: true,
        members: [5683, 55668833, 540524],
      });
      const partialEntity: any = {};
      return preHandlePartialEntity(partialEntity, originalEntity);
    },
  );
  getMergedEntity = jest.fn();
  getRollbackPartialEntity = jest.fn();
}

class TestRequestController implements IRequestController<Group> {
  get = jest.fn();
  put = jest.fn();
  post = jest.fn();
}

describe('TeamController', () => {
  let teamActionController: TeamActionController;
  let testPartialModifyController: TestPartialModifyController;
  let testRequestController: TestRequestController;
  beforeEach(() => {
    testPartialModifyController = new TestPartialModifyController();
    testRequestController = new TestRequestController();

    buildRequestController.mockImplementation(() => {
      return testRequestController;
    });

    buildPartialModifyController.mockImplementation(() => {
      return testPartialModifyController;
    });

    teamActionController = new TeamActionController(
      testPartialModifyController,
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
      expect(testPartialModifyController.updatePartially).toReturnWith({
        members: [5683, 55668833, 540524, 123],
      });
    });
  });

  describe('leaveTeam()', () => {
    it('should call partial modify controller.', async () => {
      await teamActionController.leaveTeam(5683, 2);
      expect(testPartialModifyController.updatePartially).toBeCalled();
      expect(testPartialModifyController.updatePartially).toReturnWith({
        members: [55668833, 540524],
      });
    });
  });

  describe('addTeamMembers()', () => {
    it('should call partial modify controller.', async () => {
      await teamActionController.addTeamMembers([123, 456], 2);
      expect(testPartialModifyController.updatePartially).toBeCalled();
      expect(testPartialModifyController.updatePartially).toReturnWith({
        members: [5683, 55668833, 540524, 123, 456],
      });
    });
  });

  describe('removeTeamMembers()', () => {
    it('should call partial modify controller.', async () => {
      await teamActionController.removeTeamMembers([540524, 5683], 2);
      expect(testPartialModifyController.updatePartially).toBeCalled();
      expect(testPartialModifyController.updatePartially).toReturnWith({
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
});
