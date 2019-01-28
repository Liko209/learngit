/*
 * @Author: isaac.liu
 * @Date: 2019-01-28 18:39:15
 * Copyright © RingCentral. All rights reserved.
 */
import { getFileIcon } from '../getFileName';
import { ImageFileExtensions } from 'sdk/module/item/module/file/utils/ImageFileExtensions';

describe('Conversation sheet helpers', () => {
  it('getFileIcon()', () => {
    let type = getFileIcon('xlsx');
    expect(type).toBe('excel');
    const type1 = getFileIcon('xxx');
    expect(type1).toBe('default_file');

    type = getFileIcon('doc');
    expect(type).toBe('doc');
    type = getFileIcon('pptx');
    expect(type).toBe('ppt');
    type = getFileIcon('pdf');
    expect(type).toBe('pdf');
    type = getFileIcon('zip');
    expect(type).toBe('zip');
    type = getFileIcon('rar');
    expect(type).toBe('zip');
    type = getFileIcon('mp3');
    expect(type).toBe('default_music');
    type = getFileIcon('mov');
    expect(type).toBe('default_video');
    Array.from(ImageFileExtensions).forEach((ext: string) => {
      type = getFileIcon(ext);
      expect(type).toBe('image_preview');
    });
  });
});
