/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-24 22:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../store/utils';
jest.mock('../../../../store/utils');
import { ProfileGroupBodyViewModel } from '../ProfileGroupBody.ViewModel';
const profileBodyVM = new ProfileGroupBodyViewModel({ id: 123, dismiss( ) {}, isGroupOrTeam: true, type: 2 });

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
