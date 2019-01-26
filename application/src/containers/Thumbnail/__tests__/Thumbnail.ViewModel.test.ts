/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-21 13:31:38
 * Copyright © RingCentral. All rights reserved.
 */
import { ItemService } from 'sdk/module/item/service';
import { FileItemUtils } from 'sdk/module/item/utils';
// import { FileType } from '@/store/models/FileItem';
import { getEntity } from '../../../store/utils';
// import { getFileType } from '../../../common/getFileType';
import { ThumbnailViewModel } from '../Thumbnail.ViewModel';

jest.mock('../../../store/utils');
jest.mock('../../../common/getFileType');
jest.mock('sdk/module/item/service');

let thumbnailViewModel: ThumbnailViewModel;

const previewUrl = 'http://www.google.com';
const itemService = {
  getThumbsUrlWithSize: jest.fn(),
};
ItemService.getInstance = jest.fn();

describe('ThumbnailViewModel', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  beforeEach(() => {
    ItemService.getInstance.mockReturnValue(itemService);
  });
  describe('get fileTypeOrUrl()', () => {
    it('should get image url', async () => {
      (getEntity as jest.Mock).mockReturnValue({
        type: 'application/json',
      });

      // (getFileType as jest.Mock).mockReturnValue({
      //   previewUrl,
      //   type: FileType.image,
      // });
      itemService.getThumbsUrlWithSize.mockResolvedValue(previewUrl);

      FileItemUtils.isSupportPreview = jest.fn().mockReturnValue(true);

      thumbnailViewModel = new ThumbnailViewModel();
      await thumbnailViewModel.onReceiveProps({ id: 123 });

      expect(thumbnailViewModel.fileTypeOrUrl).toEqual({
        url: previewUrl,
        icon: '',
      });
    });
    it('should get file type', async () => {
      (getEntity as jest.Mock).mockReturnValue({
        type: 'doc',
        iconType: 'doc',
      });

      FileItemUtils.isSupportPreview = jest.fn().mockReturnValue(false);

      thumbnailViewModel = new ThumbnailViewModel();
      await thumbnailViewModel.onReceiveProps({ id: 123 });

      expect(thumbnailViewModel.fileTypeOrUrl).toEqual({
        url: '',
        icon: 'doc',
      });
    });
    it('should get default type', async () => {
      (getEntity as jest.Mock).mockReturnValue({
        type: '',
      });

      FileItemUtils.isSupportPreview = jest.fn().mockReturnValue(false);

      thumbnailViewModel = new ThumbnailViewModel();
      await thumbnailViewModel.onReceiveProps({ id: 123 });

      expect(thumbnailViewModel.fileTypeOrUrl).toEqual({
        url: '',
        icon: '',
      });
    });
  });
});
