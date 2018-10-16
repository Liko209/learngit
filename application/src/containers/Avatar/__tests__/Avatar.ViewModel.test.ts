/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 10:19:56
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../store/utils';
import { AvatarViewModel } from '../Avatar.ViewModel';
jest.mock('../../../store/utils');

const avatarViewModel = new AvatarViewModel();

describe('AvatarVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  it('bgColor()', () => {
    avatarViewModel.props.uid = 1;
    expect(avatarViewModel.bgColor).toBe('lake');
  });

  it('name()', () => {
    (getEntity as jest.Mock).mockReturnValue({ shortName: 'AB' });
    expect(avatarViewModel.shortName).toBe('AB');
  });
});
