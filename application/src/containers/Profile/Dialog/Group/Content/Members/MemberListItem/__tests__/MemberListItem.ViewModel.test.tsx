/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-06 16:57:29
 * Copyright © RingCentral. All rights reserved.
 */

import { getEntity } from '../../../../../../../../store/utils';
import { MemberListItemViewModel } from '../MemberListItem.ViewModel';
import { ENTITY_NAME } from '@/store';

jest.mock('../../../../../../../../store/utils');

const mockGroupData = {
  displayName: 'Group name',
  isThePersonAdmin: jest.fn(),
  isThePersonGuest: jest.fn(),
};

const mockPersonData = {
  id: 1,
  userDisplayName: 'Name1',
};

const mockMap = {
  [ENTITY_NAME.GROUP]: mockGroupData,
  [ENTITY_NAME.PERSON]: mockPersonData,
};

const props = {
  cid: 1,
  pid: 2,
};
const vm = new MemberListItemViewModel(props);

describe('MemberListItem.ViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockImplementation((name, id) => {
      return mockMap[name];
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be get conversation id when the component is instantiated', () => {
    expect(vm.cid).toEqual(props.cid);
  });

  it('should be get person id when the component is instantiated', () => {
    expect(vm.pid).toEqual(props.pid);
  });

  it('should be get group entity when invoke class instance property person [JPT-405]', () => {
    expect(vm.person).toEqual(mockPersonData);
    mockPersonData.userDisplayName = 'Name 2';
    expect(vm.person).toEqual(mockPersonData);
  });

  it('should be get correct boolean value when mock group entity isThePersonAdmin method [JPT-405]', () => {
    mockGroupData.isThePersonAdmin = jest.fn().mockReturnValueOnce(true);
    expect(vm.isThePersonAdmin).toEqual(true);
    mockGroupData.isThePersonAdmin = jest.fn().mockReturnValueOnce(false);
    expect(vm.isThePersonAdmin).toEqual(false);
  });

  it('should be get correct boolean value when mock group entity isThePersonGuest method [JPT-405]', () => {
    mockGroupData.isThePersonGuest = jest.fn().mockReturnValueOnce(true);
    expect(vm.isThePersonGuest).toEqual(true);
    mockGroupData.isThePersonGuest = jest.fn().mockReturnValueOnce(false);
    expect(vm.isThePersonGuest).toEqual(false);
  });
});
