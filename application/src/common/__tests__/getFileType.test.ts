/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-14 09:32:26
 * Copyright © RingCentral. All rights reserved.
 */
import { FileType } from '../../store/models/FileItem';
import { getFileType } from '../getFileType';
import { SupportPreviewImageExtensions } from 'sdk/module/item/module/file/utils/ImageFileExtensions';

const previewUrl = 'http://www.google.com';

describe('getFileType', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be image type when include target type', () => {
    const IMAGE_TYPE = new Set(
      [...SupportPreviewImageExtensions].map(type => type.toUpperCase()),
    );
    const arr = [...SupportPreviewImageExtensions, ...IMAGE_TYPE];
    arr.forEach((type: string) => {
      const fileItem = {
        type,
        versionUrl: previewUrl,
      };
      const extendFile = getFileType(fileItem);
      expect(extendFile.type).toBe(FileType.image);
      expect(extendFile.previewUrl).toBe(previewUrl);
      expect(extendFile.item).toEqual(fileItem);
    });
  });

  it('should be image type when upload image', () => {
    const fileItem = {
      type: 'image/xxx.jpg',
      versionUrl: previewUrl,
    };
    const extendFile = getFileType(fileItem);
    expect(extendFile.type).toBe(FileType.image);
    expect(extendFile.previewUrl).toBe(previewUrl);
    expect(extendFile.item).toEqual(fileItem);
  });
  it('should be document type when item has pages', () => {
    const fileItem = {
      pages: [
        {
          url: previewUrl,
        },
      ],
    };
    const extendFile = getFileType(fileItem);
    expect(extendFile.type).toBe(FileType.document);
    expect(extendFile.previewUrl).toBe(previewUrl);
    expect(extendFile.item).toEqual(fileItem);
  });

  it('should be other types when item don"t include pages, thumbs, type not include image', () => {
    const fileItem = {};
    const extendFile = getFileType(fileItem);
    expect(extendFile.type).toBe(FileType.others);
    expect(extendFile.previewUrl).toBe('');
    expect(extendFile.item).toEqual(fileItem);
  });
});
