/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-25 15:06:10
 * Copyright © RingCentral. All rights reserved.
 */
import { FilesViewModel } from '../Files.ViewModel';
import ItemModel from '@/store/models/Item';

const filesViewModel = new FilesViewModel();

describe('File items tests', () => {
  it('needPreview()', () => {
    const isNeed = filesViewModel.needPreview({
      pages: [{ file_id: 1, url: '123' }],
      thumbs: {},
    } as ItemModel);
    expect(isNeed).toBe(true);

    const isNeed2 = filesViewModel.needPreview({} as ItemModel);
    expect(isNeed2).toBe(false);
  });

  it('getFileIcon()', () => {
    const type = filesViewModel.getFileIcon('xlsx');
    expect(type).toBe('sheet');
    const type1 = filesViewModel.getFileIcon('xxx');
    expect(type1).toBeNull();
  });

  it('getPreviewFileInfo()', () => {
    const url = filesViewModel.getPreviewFileInfo({
      pages: [{ file_id: 1, url: '123' }],
    } as ItemModel);
    expect(url).toBe('123');
    const url1 = filesViewModel.getPreviewFileInfo({
      thumbs: {
        a: 'http://www.google.com',
      },
    } as ItemModel);
    expect(url1).toBe('http://www.google.com');
  });
});
