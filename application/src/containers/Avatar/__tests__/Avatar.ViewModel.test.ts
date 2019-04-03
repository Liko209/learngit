/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-11 10:19:56
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../store/utils';
import { AvatarViewModel } from '../Avatar.ViewModel';
jest.mock('../../../store/utils');
jest.mock('sdk/api');
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

  describe('headShotUrl()', () => {
    it('should return "" if headShot not exist', () => {
      (getEntity as jest.Mock).mockReturnValue({ hasHeadShot: '' });
      expect(avatarViewModel.headShotUrl).toBe('');
    });

    // With the current design, this case is no longer supported
    it('should return url if headshot is string and hasHeadShot is false', () => {
      (getEntity as jest.Mock).mockReturnValue({
        hasHeadShot: true,
        headshot: 'https://avatar.url',
        headShotVersion: '',
      });
      expect(avatarViewModel.headShotUrl).toBe('https://avatar.url');
    });
    it('should return url if headshot is object and hasHeadShot is false', () => {
      (getEntity as jest.Mock).mockReturnValue({
        hasHeadShot: true,
        headshot: { url: 'https://avatar.url' },
      });
      expect(avatarViewModel.headShotUrl).toBe('https://avatar.url');
    });
    it('should return thumbs url if hasHeadShot is true and headshot not exist', () => {
      (getEntity as jest.Mock).mockReturnValue({
        hasHeadShot: true,
        headshot_version: '',
        headshot: {
          thumbs: {
            '90791948crop=1024x1024&offset=0x0&size=80x80':
              'https://xmnup.s3.amazonaws.com',
            '90791948crop = 1024x1024 & offset= 0x0 & size=92':
              'https://xmnup.s3.amazonaws.com/web/175947788/',
            '90791948crop = 1024x1024 & offset= 0x0 & size=100':
              'https://xmnup.s3.amazonaws.com/web/90841100',
            '90791948crop = 1024x1024 & offset= 0x0 & size=138':
              'https://xmnup.s3.amazonaws.com/web/171155468',
            '90791948crop = 1024x1024 & offset= 0x0 & size=150':
              'https://xmnup.s3.amazonaws.com/web/90824716',
          },
        },
      });
      expect(avatarViewModel.headShotUrl).toBe(
        'https://xmnup.s3.amazonaws.com/web/90824716',
      );
    });
  });
});
