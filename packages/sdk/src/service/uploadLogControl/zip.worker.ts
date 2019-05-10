/*
 * @Author: Paynter Chen
 * @Date: 2019-05-05 15:07:26
 * Copyright © RingCentral. All rights reserved.
 */
import JSZip from 'jszip';
import { ZipItem } from './types';

enum ZIP_LEVEL {
  LOW = 3,
  MIDDLE = 6,
  HEIGH = 9,
}

export async function zip(zipItems: ZipItem[]) {
  const zip = new JSZip();
  const nameMap = new Map<string, number>();
  zipItems.forEach(zipItem => {
    if (nameMap.has(zipItem.name)) {
      nameMap.set(zipItem.name, nameMap.get(zipItem.name)! + 1);
      const fileName = `${zipItem.name}-${nameMap.get(zipItem.name)}${
        zipItem.type
      }`;
      zipItem.folder
        ? zip.folder(zipItem.folder).file(fileName, zipItem.content)
        : zip.file(fileName, zipItem.content);
    } else {
      nameMap.set(zipItem.name, 1);
      const fileName = `${zipItem.name}${zipItem.type}`;
      zipItem.folder
        ? zip.folder(zipItem.folder).file(fileName, zipItem.content)
        : zip.file(fileName, zipItem.content);
    }
  });
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: ZIP_LEVEL.HEIGH,
    },
  });
}
