/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 10:19:56
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../store/utils';
import { AvatarViewModel } from '../Avatar.ViewModel';
jest.mock('../../../store/utils');

describe('AvatarVM', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  it('bgColor()', () => {
    const avatarViewModel = new AvatarViewModel();
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

  describe('url()', () => {
    it('headshot is string', () => {
      (getEntity as jest.Mock).mockReturnValue({
        headshot: 'http://avatar.xxx',
      });
      const avatarViewModel = new AvatarViewModel();
      expect(avatarViewModel.url).toBe('http://avatar.xxx');
    });
    it('headshot is object', () => {
      (getEntity as jest.Mock).mockReturnValue({
        headshot: { url: 'http://avatar.xxxx' },
      });
      const avatarViewModel = new AvatarViewModel();
      expect(avatarViewModel.url).toBe('http://avatar.xxxx');
    });
  });
});
