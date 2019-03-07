/*
 * @Author: isaac.liu
 * @Date: 2019-02-15 08:26:10
 * Copyright © RingCentral. All rights reserved.
 */

import FileItemModel from '@/store/models/FileItem';
import { FileItem } from 'sdk/module/item/module/file/entity';

function getThumbnailURL(
  item: FileItemModel | FileItem,
  size: { width: number; height: number } = { width: 1000, height: 200 },
) {
  const { versions } = item;
  if (versions.length > 0) {
    const version = versions[0];
    // hard code as dThor
    const { width, height } = size;
    const key = `${version.stored_file_id}size=${width}x${height}`;
    const { thumbs } = version;
    if (thumbs) {
      return thumbs[key];
    }
  }
  return '';
}

export { getThumbnailURL };
