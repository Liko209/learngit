/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-25 15:06:10
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '../../../../store/utils';
import { FilesViewModel } from '../Files.ViewModel';
import { service } from 'sdk';
jest.mock('../../../../store/utils');
// import ItemModel from '@/store/models/Item';
// import { FileType } from '../types';

const { ItemService } = service;
ItemService.getInstance = jest.fn().mockReturnValue({});

const filesItemVM = new FilesViewModel();
filesItemVM.props.ids = [1, 2, 3];

const mockItemValue = {
  name: 'filename',
  type: 2,
  id: 1,
  pages: {
    file_id: 11,
    url: 'http://www.xxx.com',
  },
  isNew: false,
  isDocument: true,
  url: 'https://material-ui.com/',
};

describe('filesItemVM', () => {
  beforeEach(() => {
    (getEntity as jest.Mock).mockReturnValue({
      ...mockItemValue,
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('get _ids', () => {
    expect(filesItemVM._ids).toEqual([1, 2, 3]);
  });

  it('get items', () => {
    expect(filesItemVM.items).toMatchObject([
      {
        ...mockItemValue,
      },
      { ...mockItemValue },
      { ...mockItemValue },
    ]);
  });
});
