/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-10 10:29:06
 * Copyright © RingCentral. All rights reserved.
 */
import { FileType } from '../../../../store/models/FileItem';
import { getEntity } from '../../../../store/utils';
import { getFileType } from '../../../../common/getFileType';
import { FileItemViewModel } from '../FileItem.ViewModel';

jest.mock('../../../../store/utils');
jest.mock('../../../../common/getFileType');

const fileItemViewModel = new FileItemViewModel({ id: 123 });

describe('FileItemViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be not icon when file type not exist', () => {
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
  });

  it('should be not preview url when file type is not document type or image type', () => {
    (getEntity as jest.Mock).mockReturnValue({
      type: 'application/json',
    });

    (getFileType as jest.Mock).mockReturnValue({
      type: -1,
    });

    expect(fileItemViewModel.fileTypeOrUrl).toEqual({ icon: 'json', url: '' });
  });

  it('should be icon is equal to the type value when type value does not have a slash', () => {
    (getEntity as jest.Mock).mockReturnValue({
      type: 'text',
    });

    (getFileType as jest.Mock).mockReturnValue({
      type: -1,
    });

    expect(fileItemViewModel.fileTypeOrUrl).toEqual({ icon: 'text', url: '' });
  });

  it('should be empty object when type is empty string', () => {
    (getEntity as jest.Mock).mockReturnValue({
      type: '',
    });

    (getFileType as jest.Mock).mockReturnValue({
      type: -1,
    });

    expect(fileItemViewModel.fileTypeOrUrl).toEqual({ icon: '', url: '' });
  });
});
