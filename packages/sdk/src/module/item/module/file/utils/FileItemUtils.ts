/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-16 17:33:05
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import {
  GifFileExtensions,
  ImageFileExtensions,
  ResizableExtensions,
  SupportPreviewImageExtensions,
  SupportShowRawImageExtensions,
} from './ImageFileExtensions';
import { ItemVersions } from '../../../entity';

const GifSource = 'giphy';
const ImagePrefix = 'image/';

class FileItemUtils {
  static filterType<T extends { type: string }>(file: T) {
    let { type = '' } = file;
    type = type.toLowerCase();
    if (type.indexOf(ImagePrefix) === 0) {
      return type.substring(ImagePrefix.length, type.length);
    }
    return type;
  }
  static isSupportPreview<T extends { type: string }>(file: T) {
    const type = FileItemUtils.filterType(file);
    return SupportPreviewImageExtensions.has(type);
  }

  static isSupportShowRawImage<T extends { type: string }>(file: T) {
    const type = FileItemUtils.filterType(file);
    return SupportShowRawImageExtensions.has(type);
  }

  static isImageResizable<T extends { type: string }>(file: T) {
    return ResizableExtensions.has(file.type.toLowerCase());
  }

  static isGifItem<T extends { type: string }>(file: T) {
    return GifFileExtensions.has(file.type.toLowerCase());
  }

  static isImageItem<T extends { type: string }>(file: T) {
    const type = FileItemUtils.filterType(file);
    return ImageFileExtensions.has(type);
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

  static getVersionDate<T extends { versions: ItemVersions[] }>(
    file: T,
  ): number | null {
    if (!Array.isArray(file.versions)) return null;
    for (const version of file.versions) {
      if (!version.deactivated) {
        return _.isNumber(version.date) ? version.date : null;
      }
    }
    return null;
  }
}

export { FileItemUtils };
