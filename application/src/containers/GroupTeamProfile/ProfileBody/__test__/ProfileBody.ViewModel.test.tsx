/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 22:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../store/utils';
jest.mock('../../../../store/utils');
import { ProfileBodyViewModel } from '../ProfileBody.ViewModel';
const profileBodyVM = new ProfileBodyViewModel({ id: 123, dismiss( ) {} });

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
});
