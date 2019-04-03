/*
 * @Author: isaac.liu
 * @Date: 2019-01-28 20:47:18
 * Copyright © RingCentral. All rights reserved.
 */
import { ImageFileExtensions } from 'sdk/module/item/module/file/utils/ImageFileExtensions';

const FILE_ICON_MAP = {
  doc: ['doc', 'docx', 'rtf', 'dotx', 'docm', 'pages'],
  excel: ['xlsx', 'xls', 'numbers'],
  pdf: ['pdf'],
  ppt: ['ppt', 'pptx', 'potx', 'ppsx', 'pps', 'key'],
  default_file: ['file'],
  zip: ['zip', 'rar', 'iso', 'tar', '7z'],
  default_music: ['mp3', 'flac', 'ape', 'wav'],
  default_video: ['mp4', 'mpeg', 'mpg', 'mov', 'flv', 'avi', 'mkv', 'm4v'],
  image_preview: Array.from(ImageFileExtensions),
};

function getFileIcon(typeOrName?: string): string {
  if (typeOrName) {
    let type = typeOrName;
    // treat as file name
    if (type.includes('.')) {
      type = type.split('.').pop() || typeOrName;
    } else if (type.includes('/')) {
      type = type.split('/').pop() || typeOrName;
    }
    type = type.toLowerCase();
    const keys: string[] = Object.keys(FILE_ICON_MAP);
    for (let i = 0; i < keys.length; ++i) {
      const icon = keys[i];
      const types: string[] = FILE_ICON_MAP[icon] || [];
      if (types.includes(type)) {
        return icon;
      }
    }
  }
  return 'default_file';
}

export { getFileIcon };
