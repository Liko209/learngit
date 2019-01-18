/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-16 17:33:05
 * Copyright © RingCentral. All rights reserved.
 */

import {
  GifFileExtensions,
  ImageFileExtensions,
  ResizableExtensions,
  SupportPreviewImageExtensions,
} from './ImageFileExtensions';
import { ItemVersions } from '../../../entity';

const GifSource = 'giphy';

class FileItemUtils {
  static isSupportPreview<T extends { type: string }>(file: T) {
    return SupportPreviewImageExtensions.includes(file.type);
  }

  static isImageResizable<T extends { type: string }>(file: T) {
    return ResizableExtensions.includes(file.type);
  }

  static isGifItem<T extends { type: string }>(file: T) {
    const type = file.type.toLocaleLowerCase();
    return GifFileExtensions.includes(type);
  }

  static isImageItem<T extends { type: string }>(file: T) {
    const type = file.type.toLocaleLowerCase();
    return ImageFileExtensions.includes(type) || type.indexOf('image') !== -1;
  }

  static getUrl<T extends { versions: ItemVersions[] }>(file: T) {
    return (file && file.versions.length > 0 && file.versions[0].url) || '';
  }

  static getDownloadUrl<T extends { versions: ItemVersions[]; url?: string }>(
    file: T,
  ) {
    return (
      (file && file.versions.length > 0 && file.versions[0].download_url) ||
      file.url ||
      ''
    );
  }

  static getStorageId<T extends { versions: ItemVersions[] }>(file: T) {
    return (
      (file && file.versions.length > 0 && file.versions[0].stored_file_id) || 0
    );
  }

  static isFromGiphy<T extends { source?: string }>(file: T) {
    return file.source && file.source.toLowerCase() === GifSource;
  }
}

export { FileItemUtils };
