/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-14 09:32:26
 * Copyright © RingCentral. All rights reserved.
 */
import { FileType } from '../../store/models/FileItem';
import { getFileType, image, documentType } from '../getFileType';

describe('getFileType', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should be image type if item has thumbs', () => {
    const previewUrl = 'http://www.google.com';
    const fileItem = {
      thumbs: {
        xxx: previewUrl,
      },
    };
    const extendFile = getFileType(fileItem);
    expect(extendFile.type).toBe(FileType.image);
    expect(extendFile.previewUrl).toBe(previewUrl);
    expect(extendFile.item).toEqual(fileItem);
  });
  it('should be image type if include target type', () => {
    const previewUrl = 'http://www.google.com';
    const IMAGE_TYPE = ['gif', 'jpeg', 'png', 'jpg'];
    IMAGE_TYPE.forEach((type: string) => {
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

  it('should be image type if upload image', () => {
    const previewUrl = 'http://www.google.com';
    const fileItem = {
      type: 'image/xxx.jpg',
      versionUrl: previewUrl,
    };
    const extendFile = getFileType(fileItem);
    expect(extendFile.type).toBe(FileType.image);
    expect(extendFile.previewUrl).toBe(previewUrl);
    expect(extendFile.item).toEqual(fileItem);
  });
  it('should be document type if item has pages', () => {
    const previewUrl = 'http://www.google.com';
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

  it('should be other types if item don"t include pages, thumbs, type not include image', () => {
    const fileItem = {};
    const extendFile = getFileType(fileItem);
    expect(extendFile.type).toBe(FileType.others);
    expect(extendFile.previewUrl).toBe('');
    expect(extendFile.item).toEqual(fileItem);
  });
});
