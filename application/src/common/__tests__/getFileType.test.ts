/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-14 09:32:26
 * Copyright © RingCentral. All rights reserved.
 */
import { FileType } from '../../store/models/FileItem';
import { getFileType, IMAGE_TYPE } from '../getFileType';

const previewUrl = 'http://www.google.com';

describe('getFileType', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should be image type when item has thumbs', () => {
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
  it('should be image type when include target type', () => {
    const _IMAGE_TYPE = IMAGE_TYPE.concat(
      IMAGE_TYPE.map(type => type.toUpperCase()),
    );
    _IMAGE_TYPE.forEach((type: string) => {
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
