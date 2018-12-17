/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 22:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity, getGlobalValue } from '../../../../store/utils';
jest.mock('../../../../store/utils');

import { ProfilePersonBodyViewModel } from '../ProfilePersonBody.ViewModel';
const CURRENT_UID1 = 567898767;
const CURRENT_UID2 = 198765456;
let ProfilePersonBodyVM: ProfilePersonBodyViewModel;

const mockProfileVM = (type: number = 2, id: number = 123) => {
  ProfilePersonBodyVM = new ProfilePersonBodyViewModel({
    id,
    dismiss() {},
    type,
  });
  return ProfilePersonBodyVM;
};
const mockPersonProperty = (key: string, value1: string, value2: string) => {
  (getEntity as jest.Mock).mockReturnValue({
    [key]: value1,
  });
  mockProfileVM(2);
  expect(ProfilePersonBodyVM[key]).toBe(value1);
  mockProfileVM(3);
  (getEntity as jest.Mock).mockReturnValue({
    [key]: value2,
  });
  expect(ProfilePersonBodyVM[key]).toBe(value2);
};
describe('ProfilePersonBodyViewModel', () => {
  it('should computed isCurrentUser while user id changed', () => {
    mockProfileVM(2, CURRENT_UID1);
    (getGlobalValue as jest.Mock).mockReturnValue(CURRENT_UID1);
    expect(ProfilePersonBodyVM.isCurrentUser).toBe(true);
    mockProfileVM(2, CURRENT_UID1);
    (getGlobalValue as jest.Mock).mockReturnValue(CURRENT_UID2);
    expect(ProfilePersonBodyVM.isCurrentUser).toBe(false);
  });
  it('should computed awayStatus while type changed', () => {
    mockPersonProperty('awayStatus', 'on vocation', 'on working');
  });
  it('should computed isGroup while type changed', () => {
    mockProfileVM(2);
    expect(ProfilePersonBodyVM.isGroup).toBe(true);
    mockProfileVM(3);
    expect(ProfilePersonBodyVM.isGroup).toBe(false);
  });
});
