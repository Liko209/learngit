/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-20 14:56:18
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import { getGlobalValue } from '../../../store/utils';
import storeManager from '../../../store/index';
import { CreateTeamViewModel } from '../CreateTeam.ViewModel';
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
    groupService.createTeam = jest.fn().mockImplementation(() => ({}));

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
    groupService.createTeam = jest.fn().mockResolvedValue({
      error: {
        code: 'already_taken',
      },
    });

    jest.spyOn(createTeamVM, 'createErrorHandler');
    const name = 'name';
    const memberIds = [1, 2];
    const description = 'description';
    const options = {
      isPublic: true,
      canPost: true,
    };
    try {
      await createTeamVM.create(name, memberIds, description, options);
    } catch (err) {
      expect(createTeamVM.createErrorHandler).toHaveBeenCalledWith({
        error: {
          code: 'already_taken',
        },
      });
    }
  });

  it('create team server error', async () => {
    const creatorId = 1;
    accountService.getCurrentUserId = jest
      .fn()
      .mockImplementation(() => creatorId);
    groupService.createTeam = jest.fn().mockRejectedValue('error');

    const name = 'name';
    const memberIds = [1, 2];
    const description = 'description';
    const options = {
      isPublic: true,
      canPost: true,
    };
    try {
      await createTeamVM.create(name, memberIds, description, options);
    } catch (err) {
      expect(createTeamVM.serverError).toBe(true);
    }
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
    createTeamVM.createErrorHandler({
      error: {
        code: 'already_taken',
        message: '',
        validation: false,
      },
    });
    expect(createTeamVM.errorMsg).toBe('already taken');
    expect(createTeamVM.nameError).toBe(true);
    createTeamVM.createErrorHandler({
      error: {
        message: '',
        validation: true,
        code: 'invalid_field',
      },
    });
    expect(createTeamVM.emailErrorMsg).toBe('Invalid Email');
    expect(createTeamVM.emailError).toBe(true);
  });
});
