/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-02 12:06:38
 * Copyright © RingCentral. All rights reserved.
 */
import { ImageFileExtensions } from 'sdk/module/item/module/file/utils/ImageFileExtensions';

const getFileName = (filename: string) => {
  if (!filename) return '';

  const name = filename;
  const right = name.substr(-7);
  const left = name.replace(right, '');
  return [left, right];
};

const truncateLongName = (name: string) => {
  const tailLength = 8;
  if (name && name.length > tailLength) {
    const left = name.substr(0, name.length - tailLength);
    const right = name.substr(-tailLength);
    return [left, right];
  }
  return [name, ''];
};

const getListItemSecondaryText = (text: string) => {
  if (!text) return '';

  const textArr = text.split('·');

  if (textArr.length) {
    const left = textArr[0];
    const right = textArr[1];
    return [left, right];
  }
  return [text, ''];
};

const FILE_ICON_MAP = {
  doc: ['doc', 'docx', 'pages'],
  excel: ['xlsx', 'xls', 'numbers'],
  pdf: ['pdf'],
  ppt: ['ppt', 'pptx', 'potx', 'key'],
  default_file: ['file'],
  zip: ['zip', 'rar', 'iso', 'tar', '7z'],
  default_music: ['mp3', 'flac', 'ape', 'wav'],
  default_video: ['mp4', 'mov', 'flv', 'avi', 'mkv', 'm4v'],
  image_preview: Array.from(ImageFileExtensions),
};

function getFileIcon(fileType: string): string {
  const type = ((fileType && fileType.split('/').pop()) || '').toLowerCase();
  const keys: string[] = Object.keys(FILE_ICON_MAP);
  for (let i = 0; i < keys.length; ++i) {
    const icon = keys[i];
    const types: string[] = FILE_ICON_MAP[icon] || [];
    if (types.includes(type)) {
      return icon;
    }
  }
  return 'default_file';
}

export { getFileName, truncateLongName, getListItemSecondaryText, getFileIcon };
