/*
 * @Author: Paynter Chen
 * @Date: 2019-05-05 15:07:26
 * Copyright © RingCentral. All rights reserved.
 */
import JSZip from 'jszip';

let ZIP_LEVEL;
(function (ZIP_LEVEL) {
  ZIP_LEVEL[(ZIP_LEVEL['LOW'] = 3)] = 'LOW';
  ZIP_LEVEL[(ZIP_LEVEL['MIDDLE'] = 6)] = 'MIDDLE';
  ZIP_LEVEL[(ZIP_LEVEL['HEIGH'] = 9)] = 'HEIGH';
}(ZIP_LEVEL || (ZIP_LEVEL = {})));
export function zip(zipItems) {
  const zip = new JSZip();
  const nameMap = new Map();
  zipItems.forEach(zipItem => {
    if (nameMap.has(zipItem.name)) {
      nameMap.set(zipItem.name, nameMap.get(zipItem.name) + 1);
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
  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: ZIP_LEVEL.HEIGH,
    },
  });
}
