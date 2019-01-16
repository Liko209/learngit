/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-10 10:29:06
 * Copyright © RingCentral. All rights reserved.
 */
import { FileType } from '@/store/models/FileItem';
import { getEntity } from '../../../../store/utils';
import { getFileType } from '../../../../common/getFileType';
import { FileItemViewModel } from '../FileItem.ViewModel';

jest.mock('../../../../store/utils');
jest.mock('../../../../common/getFileType');

const fileItemViewModel = new FileItemViewModel({ id: 123 });

describe('dateFormatter', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('get fileType ', () => {
    const previewUrl = 'http://www.google.com';
    (getEntity as jest.Mock).mockReturnValue({
      type: 'application/json',
    });

    (getFileType as jest.Mock).mockReturnValue({
      previewUrl,
      type: FileType.image,
    });

    expect(fileItemViewModel.fileTypeOrUrl).toEqual({
      url: previewUrl,
      icon: '',
    });

    (getFileType as jest.Mock).mockReturnValue({
      type: -1,
    });

    expect(fileItemViewModel.fileTypeOrUrl).toEqual({ icon: 'json', url: '' });

    (getEntity as jest.Mock).mockReturnValue({
      type: 'text',
    });

    expect(fileItemViewModel.fileTypeOrUrl).toEqual({ icon: 'text', url: '' });

    (getEntity as jest.Mock).mockReturnValue({
      type: '',
    });

    expect(fileItemViewModel.fileTypeOrUrl).toEqual({ icon: '', url: '' });
  });
});
