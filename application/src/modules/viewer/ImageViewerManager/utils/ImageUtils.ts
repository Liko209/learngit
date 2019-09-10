/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-03-15 19:05:36
 * Copyright © RingCentral. All rights reserved.
 */

import FileItemModel from '@/store/models/FileItem';
import { getMaxThumbnailURLInfo } from '@/common/getThumbnailURL';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';

class ImageUtils {
  static fileImageInfo(file: FileItemModel) {
    if (FileItemUtils.isSupportShowRawImage(file)) {
      return {
        url: file.versionUrl,
        width: file.origWidth,
        height: file.origHeight,
      };
    }
    if (FileItemUtils.isSupportPreview(file)) {
      if (file.thumbs) {
        return getMaxThumbnailURLInfo(file);
      }
    }
    return {
      url: undefined,
      width: 0,
      height: 0,
    };
  }
}

export { ImageUtils };
