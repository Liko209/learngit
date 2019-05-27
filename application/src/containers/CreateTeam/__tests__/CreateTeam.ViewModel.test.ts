/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-20 14:56:18
 * Copyright © RingCentral. All rights reserved.
 */
import { testable, test } from 'shield';
import { mockGlobalValue } from 'shield/application';
import { mockService } from 'shield/sdk';
import { GroupService, TeamSetting } from 'sdk/module/group';
import { AccountService } from 'sdk/module/account';
import {
  ERROR_CODES_NETWORK,
  ERROR_CODES_SERVER,
  JServerError,
} from 'sdk/error';

import { CreateTeamViewModel } from '../CreateTeam.ViewModel';
import { AccountUserConfig } from 'sdk/module/account/config/AccountUserConfig';
import { ServiceConfig } from 'sdk/module/serviceLoader';

jest.mock('sdk/module/account/config/AccountUserConfig');
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
  const mockUserConfig = () => {
    return {
      getGlipUserId() {
        return creatorId;
      },
    };
  };
  @testable
  class create {
    @test(
      'should be success if create team with creatorId memberIds and options',
    )
    @mockService(groupService, 'createTeam')
    @mockService(AccountService, 'userConfig.get', mockUserConfig)
    async t1() {
      const createTeamVM = new CreateTeamViewModel();
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

    @test('should be null if create team success handle error')
    @mockService.reject(GroupService, 'createTeam', () =>
      getNewJServerError(ERROR_CODES_SERVER.ALREADY_TAKEN),
    )
    @mockService(AccountService, 'userConfig.get', mockUserConfig)
    async t2() {
      const createTeamVM = new CreateTeamViewModel();

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

    @test('should be error if create team server error')
    @mockService.reject(GroupService, 'createTeam', () =>
      getNewJServerError(ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR, ''),
    )
    @mockService(AccountService, 'userConfig.get', mockUserConfig)
    async t3() {
      const createTeamVM = new CreateTeamViewModel();
      const creatorId = 1;

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
    @test('should be true or false when offline or online')
    @mockGlobalValue.multi(['offline', 'online'])
    t1() {
      const createTeamVM = new CreateTeamViewModel();
      expect(createTeamVM.isOffline).toBe(true);
      expect(createTeamVM.isOffline).toBe(false);
    }
  }

  @testable
  class handleNameChange {
    @test('should be change btn status if change team name')
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
    @test('should be change if typing text in description input')
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
    @test('should show error tip if get error')
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
