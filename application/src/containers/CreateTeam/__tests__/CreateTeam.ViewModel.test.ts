/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-20 14:56:18
 * Copyright © RingCentral. All rights reserved.
 */
import { err, ok } from 'foundation';
import { GroupService } from 'sdk/module/group';
import {
  JNetworkError,
  ERROR_CODES_NETWORK,
  ERROR_CODES_SERVER,
  JServerError,
} from 'sdk/error';

import { getGlobalValue } from '../../../store/utils';
import storeManager from '../../../store/index';
import { CreateTeamViewModel } from '../CreateTeam.ViewModel';
import { UserConfig } from 'sdk/service/account';

jest.mock('sdk/service/account');
jest.mock('../../Notification');
jest.mock('../../../store/utils');
jest.mock('../../../store/index');
jest.mock('sdk/api');

const groupService = {
  createTeam() {},
};
// GroupService.getInstance = jest.fn().mockReturnValue(groupService);
// AccountService.getInstance = jest.fn().mockReturnValue(accountService);

const createTeamVM = new CreateTeamViewModel();
function getNewJServerError(code: string, message: string = '') {
  return new JServerError(code, message);
}
describe('CreateTeamVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    jest.spyOn(GroupService, 'getInstance').mockReturnValue(groupService);
    const gs = {
      get: jest.fn(),
      set: jest.fn(),
    };
    jest.spyOn(storeManager, 'getGlobalStore').mockReturnValue(gs);
  });

  it('create team success', async () => {
    const creatorId = 1;
    UserConfig.getCurrentUserId = jest.fn().mockImplementation(() => creatorId);
    groupService.createTeam = jest.fn().mockImplementation(() => ok(''));

    const name = 'name';
    const memberIds = [1, 2];
    const description = 'description';
    const options = {
      name,
      description,
      isPublic: true,
      canPost: true,
    };
    await createTeamVM.create(memberIds, options);
    expect(groupService.createTeam).toHaveBeenCalledWith(
      creatorId,
      memberIds,
      options,
    );
  });

  it('create team success handle error', async () => {
    const creatorId = 1;
    UserConfig.getCurrentUserId = jest.fn().mockImplementation(() => creatorId);
    groupService.createTeam = jest
      .fn()
      .mockResolvedValue(
        err(getNewJServerError(ERROR_CODES_SERVER.ALREADY_TAKEN)),
      );

    jest.spyOn(createTeamVM, 'createErrorHandler');
    const name = 'name';
    const memberIds = [1, 2];
    const description = 'description';
    const options = {
      name,
      description,
      isPublic: true,
      canPost: true,
    };
    const result = await createTeamVM.create(memberIds, options);
    if (result.isErr()) {
      expect(result.error.code).toBe(ERROR_CODES_SERVER.ALREADY_TAKEN);
    } else {
      expect(result).toBe(false);
    }
  });

  it('create team server error', async () => {
    const creatorId = 1;
    UserConfig.getCurrentUserId = jest.fn().mockImplementation(() => creatorId);
    groupService.createTeam = jest
      .fn()
      .mockResolvedValueOnce(
        err(new JNetworkError(ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR, '')),
      );
    const name = 'name';
    const memberIds = [1, 2];
    const description = 'description';
    const options = {
      name,
      description,
      isPublic: true,
      canPost: true,
    };
    const result = await createTeamVM.create(memberIds, options);
    expect(result.isErr()).toBe(true);
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

  it('createErrorHandle()', () => {
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
  });
});
