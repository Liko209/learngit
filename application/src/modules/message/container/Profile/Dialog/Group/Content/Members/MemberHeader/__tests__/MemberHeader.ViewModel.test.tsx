/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-06 16:57:29
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity, getGlobalValue } from '@/store/utils';
import { MemberHeaderViewModel } from '../MemberHeader.ViewModel';
import { PersonService } from 'sdk/module/person';

jest.mock('@/store/utils');

const mockGroup = {
  id: 1,
  members: [],
  isCurrentUserHasPermissionAddMember: true,
};

const personService = {
  doFuzzySearchPersons: jest.fn(),
};
PersonService.getInstance = jest.fn().mockReturnValue(personService);

jest.mock('sdk/module/group', () => ({
  GroupService: jest.fn(),
}));

const props = {
  id: 1,
  onSearch: () => {},
};
let vm: MemberHeaderViewModel;

describe('MemberHeaderViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockGroup);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new MemberHeaderViewModel(props);
  });

  describe('hasShadow', () => {
    it('should be get true when invoke class instance property hasShadow', () => {
      (getGlobalValue as jest.Mock).mockReturnValue(true);
      expect(vm.hasShadow).toEqual(true);
    });

    it('should be get false when invoke class instance property hasShadow', () => {
      (getGlobalValue as jest.Mock).mockReturnValue(false);
      expect(vm.hasShadow).toEqual(false);
    });
  });

  describe('isCurrentUserHasPermissionAddMember', () => {
    it('should be get true when invoke group entity property isCurrentUserHasPermissionAddMember', () => {
      mockGroup.isCurrentUserHasPermissionAddMember = true;
      expect(vm.isCurrentUserHasPermissionAddMember).toEqual(true);
    });

    it('should be get false when invoke group entity property isCurrentUserHasPermissionAddMember', () => {
      mockGroup.isCurrentUserHasPermissionAddMember = false;
      expect(vm.isCurrentUserHasPermissionAddMember).toEqual(false);
    });
  });
});
