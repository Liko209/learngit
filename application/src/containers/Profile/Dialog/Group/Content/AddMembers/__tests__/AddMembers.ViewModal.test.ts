/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-15 15:03:48
 * Copyright © RingCentral. All rights reserved.
 */

import { getGlobalValue } from '../../../../../../../store/utils';
import storeManager from '../../../../../../../store/index';
import { AddMembersViewModel } from '../AddMembers.ViewModel';
import { GroupService } from 'sdk/module/group';

jest.mock('../../../../../../Notification');
jest.mock('../../../../../../../store/utils');
jest.mock('../../../../../../../store/index');

jest.mock('sdk/module/group', () => ({
  GroupService: jest.fn(),
}));

const groupService: GroupService = new GroupService();

const AddMembersVM = new AddMembersViewModel();
describe('AddMembersViewModel', () => {
  beforeEach(() => {
    GroupService.getInstance = jest.fn().mockReturnValue(groupService);
  });
  beforeAll(() => {
    jest.resetAllMocks();
    const gs = {
      get: jest.fn(),
      set: jest.fn(),
    };
    jest.spyOn(storeManager, 'getGlobalStore').mockReturnValue(gs);
  });

  describe('handleSearchContactChange()', () => {
    it('should members to equal [1, 3] when search contact change to [{ id: 1 }, { email: 3 }]', () => {
      AddMembersVM.handleSearchContactChange([{ id: 1 }, { email: 3 }]);
      expect(AddMembersVM.members).toEqual([1, 3]);
    });
  });
});
