/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 17:27:47
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { AvatarNameViewModel } from '../AvatarName.ViewModel';
jest.mock('@/store/utils');

const ViewModel = new AvatarNameViewModel();

describe('AvatarNameVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  it('name()', () => {
    (getEntity as jest.Mock).mockReturnValue({
      userDisplayName: 'Alan',
      isMocked: false,
    });
    expect(ViewModel.person.userDisplayName).toEqual('Alan');
  });
});
