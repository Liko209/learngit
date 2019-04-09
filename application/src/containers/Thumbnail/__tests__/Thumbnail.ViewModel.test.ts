/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-21 13:31:38
 * Copyright © RingCentral. All rights reserved.
 */
import { FileItemUtils } from 'sdk/module/item/utils';
// import { FileType } from '@/store/models/FileItem';
import { getEntity } from '../../../store/utils';
// import { getFileType } from '../../../common/getFileType';
import { ThumbnailViewModel } from '../Thumbnail.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';

jest.mock('../../../store/utils');
jest.mock('../../../common/getFileType');
jest.mock('sdk/module/item/service');

let thumbnailViewModel: ThumbnailViewModel;

const previewUrl = 'http://www.google.com';
const itemService = {
  getThumbsUrlWithSize: jest.fn(),
};

describe('ThumbnailViewModel', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });
  beforeEach(() => {
    ServiceLoader.getInstance = jest.fn().mockReturnValue(itemService);
  });
  describe('_getThumbsUrlWithSize()', () => {
    it('should get image url', () => {
      (getEntity as jest.Mock).mockReturnValue({
        type: 'application/json',
      });

      FileItemUtils.isSupportPreview = jest.fn().mockReturnValue(true);

      itemService.getThumbsUrlWithSize.mockResolvedValue(previewUrl);

      thumbnailViewModel = new ThumbnailViewModel({ id: 123 });

      setTimeout(() => {
        expect(thumbnailViewModel.thumbsUrlWithSize).toEqual(previewUrl);
      });
    });
    it('should get file type', async () => {
      (getEntity as jest.Mock).mockReturnValue({
        type: 'doc',
        iconType: 'doc',
        versions: [],
      });

      FileItemUtils.isSupportPreview = jest.fn().mockReturnValue(false);

      thumbnailViewModel = new ThumbnailViewModel({ id: 123 });

      expect(thumbnailViewModel.icon).toEqual('doc');
    });
    it('should get default type', async () => {
      (getEntity as jest.Mock).mockReturnValue({
        type: '',
        iconType: 'default_file',
      });

      FileItemUtils.isSupportPreview = jest.fn().mockReturnValue(false);

      thumbnailViewModel = new ThumbnailViewModel({ id: 123 });

      expect(thumbnailViewModel.icon).toEqual('default_file');
    });
    it('should get default type', async () => {
      (getEntity as jest.Mock).mockReturnValue({
        type: '',
        iconType: 'default_file',
      });

      FileItemUtils.isSupportPreview = jest.fn().mockReturnValue(false);

      thumbnailViewModel = new ThumbnailViewModel({ id: 123 });

      expect(thumbnailViewModel.icon).toEqual('default_file');
    });
    it('should the last url when versions store id is same as the last store id', async () => {
      const storeFileId = 111;
      const thumbUrl = 'https://www.google.com';
      (getEntity as jest.Mock).mockReturnValue({
        versions: [{ stored_file_id: storeFileId }],
      });

      FileItemUtils.isSupportPreview = jest.fn().mockReturnValue(false);

      thumbnailViewModel = new ThumbnailViewModel({ id: 123 });

      thumbnailViewModel._lastStoreFileId = storeFileId;
      thumbnailViewModel.thumbsUrlWithSize = thumbUrl;

      expect(thumbnailViewModel.thumbsUrlWithSize).toEqual(thumbUrl);
    });
  });
});
