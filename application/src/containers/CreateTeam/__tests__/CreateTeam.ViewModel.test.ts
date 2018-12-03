/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-20 14:56:18
 * Copyright © RingCentral. All rights reserved.
 */
import { err, ok } from 'foundation';
import { service } from 'sdk';
import { GroupErrorTypes } from 'sdk/service/group';
import { BaseError } from 'sdk/utils';

import { getGlobalValue } from '../../../store/utils';
import storeManager from '../../../store/index';
import { CreateTeamViewModel } from '../CreateTeam.ViewModel';

jest.mock('../../Notification');
jest.mock('../../../store/utils');
jest.mock('../../../store/index');

const { GroupService, AccountService } = service;

const groupService = {
  createTeam() {},
};
const accountService = {
  getCurrentUserId() {},
};
// GroupService.getInstance = jest.fn().mockReturnValue(groupService);
// AccountService.getInstance = jest.fn().mockReturnValue(accountService);

const createTeamVM = new CreateTeamViewModel();
function getNewBaseError(type: GroupErrorTypes, message: string) {
  return new BaseError(type, message);
}
describe('CreateTeamVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    jest.spyOn(GroupService, 'getInstance').mockReturnValue(groupService);
    jest.spyOn(AccountService, 'getInstance').mockReturnValue(accountService);
    const gs = {
      get: jest.fn(),
      set: jest.fn(),
    };
    jest.spyOn(storeManager, 'getGlobalStore').mockReturnValue(gs);
  });

  it('create team success', async () => {
    const creatorId = 1;
    accountService.getCurrentUserId = jest
      .fn()
      .mockImplementation(() => creatorId);
    groupService.createTeam = jest.fn().mockImplementation(() => ok(''));

    const name = 'name';
    const memberIds = [1, 2];
    const description = 'description';
    const options = {
      isPublic: true,
      canPost: true,
    };
    await createTeamVM.create(name, memberIds, description, options);
    expect(groupService.createTeam).toHaveBeenCalledWith(
      name,
      creatorId,
      memberIds,
      description,
      options,
    );
  });

  it('create team success handle error', async () => {
    const creatorId = 1;
    accountService.getCurrentUserId = jest
      .fn()
      .mockImplementation(() => creatorId);
    groupService.createTeam = jest
      .fn()
      .mockResolvedValue(err(getNewBaseError(GroupErrorTypes.ALREADY_TAKEN)));

    jest.spyOn(createTeamVM, 'createErrorHandler');
    const name = 'name';
    const memberIds = [1, 2];
    const description = 'description';
    const options = {
      isPublic: true,
      canPost: true,
    };
    const result = await createTeamVM.create(
      name,
      memberIds,
      description,
      options,
    );
    if (result.isErr()) {
      expect(result.error.code).toBe(GroupErrorTypes.ALREADY_TAKEN);
    } else {
      expect(result).toBe(false);
    }
  });

  it('create team server error', async () => {
    const creatorId = 1;
    accountService.getCurrentUserId = jest
      .fn()
      .mockImplementation(() => creatorId);
    groupService.createTeam = jest
      .fn()
      .mockResolvedValueOnce(err(new BaseError(500, '')));

    const name = 'name';
    const memberIds = [1, 2];
    const description = 'description';
    const options = {
      isPublic: true,
      canPost: true,
    };
    const result = await createTeamVM.create(
      name,
      memberIds,
      description,
      options,
    );
    expect(result.isErr()).toBe(true);
  });

  it('getGlobalValue', () => {
    (getGlobalValue as jest.Mock).mockReturnValue('offline');
    expect(createTeamVM.isOffline).toBe(true);
    (getGlobalValue as jest.Mock).mockReturnValue('online');
    expect(createTeamVM.isOffline).toBe(false);
  });

  it('isOpen', () => {
    (getGlobalValue as jest.Mock).mockReturnValue(undefined);
    expect(createTeamVM.isOpen).toBe(false);
    (getGlobalValue as jest.Mock).mockReturnValue(true);
    expect(createTeamVM.isOpen).toBe(true);
  });

  it('inputReset', () => {
    createTeamVM.inputReset();
    expect(createTeamVM.errorMsg).toBe('');
    expect(createTeamVM.nameError).toBe(false);
    expect(createTeamVM.disabledOkBtn).toBe(true);
    expect(createTeamVM.emailError).toBe(false);
    expect(createTeamVM.serverError).toBe(false);
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
    let error = getNewBaseError(GroupErrorTypes.ALREADY_TAKEN);
    createTeamVM.createErrorHandler(error);
    expect(createTeamVM.errorMsg).toBe('alreadyTaken');
    expect(createTeamVM.nameError).toBe(true);

    error = getNewBaseError(
      GroupErrorTypes.INVALID_FIELD,
      'This is not a valid email address: q@qq.com.',
    );
    createTeamVM.createErrorHandler(error);
    expect(createTeamVM.emailErrorMsg).toBe('Invalid Email');
    expect(createTeamVM.emailError).toBe(true);
  });
});
