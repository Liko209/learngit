/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-10 10:29:06
 * Copyright © RingCentral. All rights reserved.
 */
import { FileType } from '../../../../store/models/FileItem';
import { getEntity } from '../../../../store/utils';
import { getFileType } from '../../../../common/getFileType';
import { ImageItemViewModel } from '../ImageItem.ViewModel';

jest.mock('../../../../store/utils');
jest.mock('../../../../common/getFileType');

const mockFile = {
  createdAt: 1547086968632,
  creatorId: 123,
  name: '',
};

const props = {
  id: 1,
};

let vm: ImageItemViewModel;

describe('ImageItemViewModel', () => {
  beforeAll(() => {
    (getEntity as jest.Mock).mockReturnValue(mockFile);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    vm = new ImageItemViewModel(props);
  });

  describe('url', () => {
    const previewUrl = 'IMAGE_URL';

    it('should be a string when item is image type [JPT-965]', () => {
      (getFileType as jest.Mock).mockReturnValue({
        previewUrl,
        type: FileType.image,
      });
      expect(vm.url).toEqual(previewUrl);
    });
  });
});
