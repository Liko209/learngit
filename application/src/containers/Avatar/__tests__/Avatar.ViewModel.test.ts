/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 10:19:56
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../store/utils';
import { AvatarViewModel } from '../Avatar.ViewModel';
jest.mock('../../../store/utils');
// import PersonAPI from '../../../../../packages/sdk/src/api/glip/person';

const avatarViewModel = new AvatarViewModel();
describe('AvatarVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  it('bgColor()', () => {
    avatarViewModel.onReceiveProps({
      uid: 1,
    });
    expect(avatarViewModel.bgColor).toBe('lake');
  });

  it('name()', () => {
    (getEntity as jest.Mock).mockReturnValue({ shortName: 'AB' });
    const avatarViewModel = new AvatarViewModel();
    expect(avatarViewModel.name).toBe('AB');
  });
});
