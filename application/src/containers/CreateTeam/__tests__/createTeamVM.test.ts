/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-20 14:56:18
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import CreateTeamVM from '../createTeamVM';

const { GroupService, AccountService } = service;

const groupService = {
  createTeam() {},
};
const accountService = {
  getCurrentUserId() {},
};
// GroupService.getInstance = jest.fn().mockReturnValue(groupService);
// AccountService.getInstance = jest.fn().mockReturnValue(accountService);

const createTeamVM = new CreateTeamVM();

describe('CreateTeamVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    jest.spyOn(GroupService, 'getInstance').mockReturnValue(groupService);
    jest.spyOn(AccountService, 'getInstance').mockReturnValue(accountService);
  });

  it('create()', async () => {
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

  it('createErrorHandle()', () => {
    const errorMsg = createTeamVM.createErrorHandle({
      error: {
        code: 'already_taken',
      },
    });
    expect(errorMsg).toBe('already taken');
  });
});
