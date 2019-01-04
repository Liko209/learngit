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
  let teamActionController: TeamActionController;
  let testPartialModifyController: TestPartialModifyController;
  let testRequestController: TestRequestController;
  beforeEach(() => {
    testPartialModifyController = new TestPartialModifyController();
    testRequestController = new TestRequestController();
    teamActionController = new TeamActionController(
      testPartialModifyController,
      testRequestController,
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
    it('should call partial modify controller', async () => {
      await teamActionController.joinTeam(123, 2);
      expect(testPartialModifyController.updatePartially).toBeCalled();
    });
  });
});
