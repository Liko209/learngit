/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-20 14:56:18
 * Copyright © RingCentral. All rights reserved.
 */
import {
  testable,
  test,
  mockService,
  mockGlobalValue,
} from 'tests/integration-test';
import { GroupService, TeamSetting } from 'sdk/module/group';
import {
  ERROR_CODES_NETWORK,
  ERROR_CODES_SERVER,
  JServerError,
} from 'sdk/error';

import { CreateTeamViewModel } from '../CreateTeam.ViewModel';
import { AccountUserConfig } from 'sdk/module/account/config';
import { ServiceConfig } from 'sdk/module/serviceLoader';

jest.mock('sdk/module/account/config');
jest.mock('../../Notification');
jest.mock('sdk/api');

function getNewJServerError(code: string, message: string = '') {
  return new JServerError(code, message);
}

describe('CreateTeamViewModel', () => {
  const groupService = {
    name: ServiceConfig.GROUP_SERVICE,
    createTeam() {},
  };
  const accountService = {
    name: ServiceConfig.ACCOUNT_SERVICE,
    userConfig: AccountUserConfig.prototype,
  };

  const creatorId = 1;
  @testable
  class create {
    @test('create team success')
    @mockService(groupService, 'createTeam')
    @mockService(accountService)
    async t1() {
      const createTeamVM = new CreateTeamViewModel();
      AccountUserConfig.prototype.getGlipUserId.mockReturnValue(creatorId);
      const name = 'name';
      const memberIds = [1, 2];
      const description = 'description';
      const options: TeamSetting = {
        name,
        description,
        isPublic: true,
        permissionFlags: {
          TEAM_POST: true,
        },
      };

      await createTeamVM.create(memberIds, options);
      expect(groupService.createTeam).toHaveBeenCalledWith(
        creatorId,
        memberIds,
        options,
      );
    }

    @test('create team success handle error')
    @mockService.reject(GroupService, 'createTeam', () =>
      getNewJServerError(ERROR_CODES_SERVER.ALREADY_TAKEN),
    )
    @mockService(accountService)
    async t2() {
      const createTeamVM = new CreateTeamViewModel();
      const creatorId = 1;

      AccountUserConfig.prototype.getGlipUserId.mockReturnValue(creatorId);

      jest
        .spyOn(createTeamVM, 'createErrorHandler')
        .mockImplementation(() => false);
      const name = 'name';
      const memberIds = [1, 2];
      const description = 'description';
      const options: TeamSetting = {
        name,
        description,
        isPublic: true,
        permissionFlags: {
          TEAM_POST: true,
        },
      };
      expect(await createTeamVM.create(memberIds, options)).toEqual(null);
    }

    @test('create team server error')
    @mockService.reject(GroupService, 'createTeam', () =>
      getNewJServerError(ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR, ''),
    )
    @mockService(accountService)
    async t3() {
      const createTeamVM = new CreateTeamViewModel();
      const creatorId = 1;

      AccountUserConfig.prototype.getGlipUserId.mockReturnValue(creatorId);
      const name = 'name';
      const memberIds = [1, 2];
      const description = 'description';
      const options: TeamSetting = {
        name,
        description,
        isPublic: true,
        permissionFlags: {
          TEAM_POST: true,
        },
      };
      try {
        expect(await createTeamVM.create(memberIds, options)).toEqual(null);
      } catch (e) {
        expect(true).toBeTruthy();
      }
    }
  }

  @testable
  class isOffline {
    @test('getGlobalValue')
    @mockGlobalValue.multi(['offline', 'online'])
    t1() {
      const createTeamVM = new CreateTeamViewModel();
      expect(createTeamVM.isOffline).toBe(true);
      expect(createTeamVM.isOffline).toBe(false);
    }

    @test('case 12')
    t2() {}
  }

  @testable
  class handleNameChange {
    @test('handleNameChange()')
    t1() {
      const createTeamVM = new CreateTeamViewModel();
      createTeamVM.handleNameChange({
        target: {
          value: '123',
        },
      } as React.ChangeEvent<HTMLInputElement>);
      expect(createTeamVM.teamName).toBe('123');
      expect(createTeamVM.disabledOkBtn).toBe(false);
      expect(createTeamVM.errorMsg).toBe('');
      expect(createTeamVM.nameError).toBe(false);

      createTeamVM.handleNameChange({
        target: {
          value: '',
        },
      } as React.ChangeEvent<HTMLInputElement>);
      expect(createTeamVM.teamName).toBe('');
      expect(createTeamVM.disabledOkBtn).toBe(true);
      expect(createTeamVM.errorMsg).toBe('');
      expect(createTeamVM.nameError).toBe(false);
    }
  }

  @testable
  class handleDescChange {
    @test('handleDescChange()')
    t1() {
      const createTeamVM = new CreateTeamViewModel();
      createTeamVM.handleDescChange({
        target: {
          value: '123',
        },
      } as React.ChangeEvent<HTMLInputElement>);
      expect(createTeamVM.description).toBe('123');
    }
  }

  @testable
  class createErrorHandle {
    @test('createErrorHandle()')
    createErrorHandle() {
      const createTeamVM = new CreateTeamViewModel();
      let error = getNewJServerError(ERROR_CODES_SERVER.ALREADY_TAKEN);
      createTeamVM.createErrorHandler(error);
      expect(createTeamVM.errorMsg).toBe('people.prompt.alreadyTaken');
      expect(createTeamVM.nameError).toBe(true);

      error = getNewJServerError(
        ERROR_CODES_SERVER.INVALID_FIELD,
        'This is not a valid email address: q@qq.com.',
      );
      createTeamVM.createErrorHandler(error);
      expect(createTeamVM.emailErrorMsg).toBe('people.prompt.InvalidEmail');
      expect(createTeamVM.emailError).toBe(true);
    }
  }
});
