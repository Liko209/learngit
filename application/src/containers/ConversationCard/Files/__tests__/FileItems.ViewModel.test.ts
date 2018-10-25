/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-25 15:06:10
 * Copyright © RingCentral. All rights reserved.
 */
import { FileItemsViewModel } from '../FileItems.ViewModel';
import ItemModel from '@/store/models/Item';

const fileItemsViewModel = new FileItemsViewModel();

describe('File items tests', () => {
  it('needPreview()', () => {
    const isNeed = fileItemsViewModel.needPreview({
      pages: [{ file_id: 1, url: '123' }],
      thumbs: {},
    } as ItemModel);
    expect(isNeed).toBe(true);

    const isNeed2 = fileItemsViewModel.needPreview({} as ItemModel);
    expect(isNeed2).toBe(false);
  });

  it('getFileIcon()', () => {
    const type = fileItemsViewModel.getFileIcon('xlsx');
    expect(type).toBe('sheet');
    const type1 = fileItemsViewModel.getFileIcon('xxx');
    expect(type1).toBeNull();
  });

  it('getPreviewFileInfo()', () => {
    const url = fileItemsViewModel.getPreviewFileInfo({
      pages: [{ file_id: 1, url: '123' }],
    } as ItemModel);
    expect(url).toBe('123');
    const url1 = fileItemsViewModel.getPreviewFileInfo({
      thumbs: {
        a: 'http://www.google.com',
      },
    } as ItemModel);
    expect(url1).toBe('http://www.google.com');
  });
});
