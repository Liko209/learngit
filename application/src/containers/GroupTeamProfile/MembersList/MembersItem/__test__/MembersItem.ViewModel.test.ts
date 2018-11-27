/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 15:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../../store/utils';
import { MembersItemViewModel } from '../MembersItem.ViewModel';
import { CONVERSATION_TYPES } from '@/constants';

const membersItemViewModel = new MembersItemViewModel({ uid: 123, gid: 123456 });

jest.mock('../../../../../store/utils');
function mockReturnGuest(isGuest: boolean) {
  return (getEntity as jest.Mock) = jest.fn().mockReturnValue({
    isThePersonGuest: jest.fn(() => {
      return isGuest;
    }),
  });
}
function mockReturnAdmin(isAdmin: boolean) {
  return (getEntity as jest.Mock) = jest.fn().mockReturnValue({
    isThePersonAdmin: jest.fn(() => {
      return isAdmin;
    }),
  });
}
function mockReturnGroupType(type: CONVERSATION_TYPES) {
  return (getEntity as jest.Mock) = jest.fn().mockReturnValue({
    type: jest.fn(() => {
      return type;
    }),
  });
}
describe('MembersItemViewModel', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  it('should return isThePersonGuest while person id provided', () => {
    mockReturnGuest(true);
    expect(membersItemViewModel.isThePersonGuest).toBe(true);
  });
  it('should return update isThePersonGuest while person id provided', () => {
    mockReturnGuest(true);
    mockReturnGuest(false);
    expect(membersItemViewModel.isThePersonGuest).toBe(false);
  });
  it('should return isThePersonAdmin while person id provided', () => {
    mockReturnGroupType(CONVERSATION_TYPES.NORMAL_GROUP);
    mockReturnAdmin(false);
    expect(membersItemViewModel.isThePersonAdmin).toBe(false);
  });
});
