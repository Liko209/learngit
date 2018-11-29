/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 22:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity, getGlobalValue } from '../../../../store/utils';
jest.mock('../../../../store/utils');
import { ProfileBodyViewModel } from '../ProfileBody.ViewModel';
const profileBodyVM = new ProfileBodyViewModel({ id: 123, dismiss( ) {} });

const CURRENT_UID1 = 567898767;
const CURRENT_UID2 = 198765456;
const mockPersonProperty = (key: string, value1: string, value2: string) => {
  (getEntity as jest.Mock).mockReturnValue({
    [key]: value1,
  });
  profileBodyVM.props.type = 2;
  expect(profileBodyVM[key]).toBe(value1);
  profileBodyVM.props.type = 3;
  (getEntity as jest.Mock).mockReturnValue({
    awayStatus: value2,
  });
  expect(profileBodyVM[key]).toBe(value2);
}
describe('ProfileBodyViewModel', () => {
  it('should return displayName if team/group id provided', () => {
    (getEntity as jest.Mock).mockReturnValue({
      displayName: 'test',
    });
    expect(profileBodyVM.name).toBe('test');
  });
  it('should return description if team/group id provided', () => {
    (getEntity as jest.Mock).mockReturnValue({
      description: 'description',
    });
    expect(profileBodyVM.description).toBe('description');
  });
  it('should computed awayStatus while type changed', () => {
    mockPersonProperty('awayStatus', 'on vocation', 'on working');
  });
  it('should computed isCurrentUser while user id changed', () => {
    profileBodyVM.props.id = CURRENT_UID1;
    (getGlobalValue as jest.Mock).mockReturnValue(CURRENT_UID1);
    expect(profileBodyVM.isCurrentUser).toBe(true);
    profileBodyVM.props.id = CURRENT_UID1;
    (getGlobalValue as jest.Mock).mockReturnValue(CURRENT_UID2);
    expect(profileBodyVM.isCurrentUser).toBe(false);
  });
});
