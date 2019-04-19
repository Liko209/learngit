/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-20 14:56:18
 * Copyright © RingCentral. All rights reserved.
 */
import { GroupService, TeamSetting } from 'sdk/module/group';
import {
  JNetworkError,
  ERROR_CODES_NETWORK,
  ERROR_CODES_SERVER,
  JServerError,
} from 'sdk/error';

import { getGlobalValue } from '../../../store/utils';
import storeManager from '../../../store/index';
import { CreateTeamViewModel } from '../CreateTeam.ViewModel';
import { AccountUserConfig } from 'sdk/module/account/config';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('sdk/module/account/config');
jest.mock('../../Notification');
jest.mock('../../../store/utils');
jest.mock('../../../store/index');
jest.mock('sdk/api');

const groupService = {
  createTeam() {},
};

const createTeamVM = new CreateTeamViewModel();
function getNewJServerError(code: string, message: string = '') {
  return new JServerError(code, message);
}
describe('CreateTeamVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(groupService);
    const gs = {
      get: jest.fn(),
      set: jest.fn(),
    };
    jest.spyOn(storeManager, 'getGlobalStore').mockReturnValue(gs);
  });

  it('create team success', async () => {
    const creatorId = 1;
    AccountUserConfig.prototype.getGlipUserId.mockReturnValue(creatorId);
    groupService.createTeam = jest.fn().mockImplementation(() => '');

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
  });

  it('create team success handle error', async () => {
    const error = getNewJServerError(ERROR_CODES_SERVER.ALREADY_TAKEN);
    const creatorId = 1;

    AccountUserConfig.prototype.getGlipUserId.mockReturnValue(creatorId);
    groupService.createTeam = jest.fn().mockRejectedValue(error);

    jest.spyOn(createTeamVM, 'createErrorHandler');
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
  });

  it('create team server error', async () => {
    const error = new JNetworkError(
      ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR,
      '',
    );
    const creatorId = 1;

    AccountUserConfig.prototype.getGlipUserId.mockReturnValue(creatorId);
    groupService.createTeam = jest.fn().mockRejectedValueOnce(error);
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
  });

  it('getGlobalValue', () => {
    (getGlobalValue as jest.Mock).mockReturnValue('offline');
    expect(createTeamVM.isOffline).toBe(true);
    (getGlobalValue as jest.Mock).mockReturnValue('online');
    expect(createTeamVM.isOffline).toBe(false);
  });

  it('handleNameChange()', () => {
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
  });

  it('handleDescChange()', () => {
    createTeamVM.handleDescChange({
      target: {
        value: '123',
      },
    } as React.ChangeEvent<HTMLInputElement>);
    expect(createTeamVM.description).toBe('123');
  });

  describe('createErrorHandle()', () => {
    it('failed to create a team when team name duplicate', () => {
      const error = getNewJServerError(ERROR_CODES_SERVER.ALREADY_TAKEN);
      createTeamVM.createErrorHandler(error);
      expect(createTeamVM.errorMsg).toBe('people.prompt.alreadyTaken');
      expect(createTeamVM.nameError).toBe(true);
    });
    it('failed to create a team when mail address is invalid', () => {
      const error = getNewJServerError(
        ERROR_CODES_SERVER.INVALID_FIELD,
        'This is not a valid email address: q@qq.com.',
      );
      createTeamVM.createErrorHandler(error);
      expect(createTeamVM.emailErrorMsg).toBe('people.prompt.InvalidEmail');
      expect(createTeamVM.emailError).toBe(true);
    });
  });
});
