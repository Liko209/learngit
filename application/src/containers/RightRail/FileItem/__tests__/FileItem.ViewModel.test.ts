/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-10 10:29:06
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../store/utils';
import { FileItemViewModel } from '../FileItem.ViewModel';

jest.mock('../../../../store/utils');

const fileItemViewModel = new FileItemViewModel();

describe('dateFormatter', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('get subTitle', () => {
    (getEntity as jest.Mock).mockReturnValue({
      createdAt: 1547086968632,
      userDisplayName: 'name',
    });

    expect(fileItemViewModel.subTitle).toBe('name · 1/10/2019');
  });

  it('get fileType', () => {
    (getEntity as jest.Mock).mockReturnValue({
      type: 'application/json',
    });

    expect(fileItemViewModel.fileType).toBe('json');

    (getEntity as jest.Mock).mockReturnValue({
      type: 'text',
    });

    expect(fileItemViewModel.fileType).toBe('text');

    (getEntity as jest.Mock).mockReturnValue({
      type: '',
    });

    expect(fileItemViewModel.fileType).toBe('');
  });
});
