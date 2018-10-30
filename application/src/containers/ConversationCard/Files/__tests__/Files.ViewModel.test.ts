/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-25 15:06:10
 * Copyright © RingCentral. All rights reserved.
 */
import { FilesViewModel } from '../Files.ViewModel';
import ItemModel from '@/store/models/Item';
import { FileType } from '../types';

const filesViewModel = new FilesViewModel();

describe('File items tests', () => {
  it('getFileIcon()', () => {
    const type = filesViewModel.getFileIcon('xlsx');
    expect(type).toBe('sheet');
    const type1 = filesViewModel.getFileIcon('xxx');
    expect(type1).toBeNull();
  });
  it('isDocument()', () => {
    const doc = filesViewModel.isDocument({
      pages: [
        {
          url: '213',
        },
      ],
    } as ItemModel);
    expect(doc).toEqual({
      isDocument: true,
      previewUrl: '213',
    });
    const doc1 = filesViewModel.isDocument({} as ItemModel);
    expect(doc1).toEqual({
      isDocument: false,
      previewUrl: '',
    });
  });

  it('isImage', () => {
    const image = filesViewModel.isImage({
      thumbs: {
        a: 'http://www.google.com',
      },
    } as ItemModel);
    expect(image).toEqual({
      isImage: true,
      previewUrl: 'http://www.google.com',
    });
    const image1 = filesViewModel.isImage({
      thumbs: {},
    } as ItemModel);
    expect(image1).toEqual({
      isImage: false,
      previewUrl: '',
    });
  });

  it('getFileType()', () => {
    const image = {
      thumbs: {
        a: 'http://www.google.com',
      },
    } as ItemModel;
    const document = {
      pages: [
        {
          url: '213',
        },
      ],
    } as ItemModel;
    const others = {} as ItemModel;
    const img = filesViewModel.getFileType(image);
    expect(img).toEqual({
      item: image,
      type: FileType.image,
      previewUrl: 'http://www.google.com',
    });

    const doc = filesViewModel.getFileType(document);
    expect(doc).toEqual({
      item: document,
      type: FileType.document,
      previewUrl: '213',
    });

    const other = filesViewModel.getFileType(others);
    expect(other).toEqual({
      item: others,
      type: FileType.others,
      previewUrl: '',
    });
  });
});
