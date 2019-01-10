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
import { ControllerBuilder } from '../../../../framework/controller/impl/ControllerBuilder';
import { IControllerBuilder } from '../../../../framework/controller/interface/IControllerBuilder';
import { Api } from '../../../../api';
import { NetworkManager, OAuthTokenManager } from 'foundation/src';

class TestPartialModifyController implements IPartialModifyController<Group> {
  updatePartially = jest.fn();
  getMergedEntity = jest.fn();
  getRollbackPartialEntity = jest.fn();
}

class TestRequestController implements IRequestController<Group> {
  get = jest.fn();
  put = jest.fn();
  post = jest.fn();
}

describe('TeamController', () => {
  let testControllerBuilder: IControllerBuilder<Group>;
  let teamActionController: TeamActionController;
  let testPartialModifyController: TestPartialModifyController;
  let testRequestController: TestRequestController;
  beforeEach(() => {
    testControllerBuilder = new ControllerBuilder<Group>();
    testPartialModifyController = new TestPartialModifyController();
    testRequestController = new TestRequestController();
    testControllerBuilder.buildRequestController = jest
      .fn()
      .mockReturnValue(testRequestController);
    testControllerBuilder.buildPartialModifyController = jest
      .fn()
      .mockReturnValue(testPartialModifyController);
    teamActionController = new TeamActionController(
      testPartialModifyController,
      testRequestController,
      testControllerBuilder,
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
    });
  });
  describe('requestAddTeamMember()', () => {
    it('should call api with correct params. [JPT-719]', async () => {
      Api.init({}, new NetworkManager(new OAuthTokenManager()));
      await teamActionController.requestAddTeamMembers(2, [123]);

      expect(testRequestController.put).toBeCalledWith({
        id: 2,
        members: [123],
      });
    });
  });
});
