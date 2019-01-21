/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-21 13:31:38
 * Copyright © RingCentral. All rights reserved.
 */
import { FileType } from '@/store/models/FileItem';
import { getEntity } from '../../../store/utils';
import { getFileType } from '../../../common/getFileType';
import { ThumbnailViewModel } from '../Thumbnail.ViewModel';

jest.mock('../../../store/utils');
jest.mock('../../../common/getFileType');

let thumbnailViewModel: ThumbnailViewModel;

describe('ThumbnailViewModel', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    thumbnailViewModel = new ThumbnailViewModel({ id: 123 });
  });

  describe('get fileTypeOrUrl()', () => {
    it('should get file type or url', () => {
      const previewUrl = 'http://www.google.com';
      (getEntity as jest.Mock).mockReturnValue({
        type: 'application/json',
      });

      (getFileType as jest.Mock).mockReturnValue({
        previewUrl,
        type: FileType.image,
      });

      expect(thumbnailViewModel.fileTypeOrUrl).toEqual({
        url: previewUrl,
        icon: '',
      });

      (getFileType as jest.Mock).mockReturnValue({
        type: -1,
      });

      expect(thumbnailViewModel.fileTypeOrUrl).toEqual({
        icon: 'json',
        url: '',
      });

      (getEntity as jest.Mock).mockReturnValue({
        type: 'text',
      });

      expect(thumbnailViewModel.fileTypeOrUrl).toEqual({
        icon: 'text',
        url: '',
      });

      (getEntity as jest.Mock).mockReturnValue({
        type: '',
      });

      expect(thumbnailViewModel.fileTypeOrUrl).toEqual({ icon: '', url: '' });
    });
  });
});
