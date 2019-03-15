/*
 * @Author: isaac.liu
 * @Date: 2019-02-15 08:26:10
 * Copyright © RingCentral. All rights reserved.
 */

import FileItemModel from '@/store/models/FileItem';
import _ from 'lodash';
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
      return <string>thumbs[key];
    }
  }
  return '';
}

function getMaxThumbnailURLInfo(item: FileItemModel) {
  if (item.thumbs && item.storeFileId) {
    const urlKeys = Object.keys(item.thumbs).filter((key: string) =>
      key.startsWith(`${item.storeFileId}`),
    );
    // {storeFileId}size={width}x{height}
    const maxInfo = {
      urlKey: '',
      width: 0,
      height: 0,
    };
    const getWidthKey = (width: number, height: number) =>
      `width-${item.storeFileId}size=${width}x${height}`;
    const getHeightKey = (width: number, height: number) =>
      `height-${item.storeFileId}size=${width}x${height}`;
    const toNumber = (value: number | string) => {
      if (_.isNumber(value)) {
        return value;
      }
      return Number(value);
    };
    urlKeys.forEach((urlKey: string) => {
      const [width, height] = urlKey
        .split('=')[1]
        .split('x')
        .map(Number);
      // width-{storeFileId}size={width}x{height}
      // height-{storeFileId}size={width}x{height}
      const realWidth = toNumber(item.thumbs![getWidthKey(width, height)]);
      const realHeight = toNumber(item.thumbs![getHeightKey(width, height)]);
      if (maxInfo.width * maxInfo.height < realWidth * realHeight) {
        maxInfo.urlKey = urlKey;
        maxInfo.height = realHeight;
        maxInfo.width = realWidth;
      }
    });
    return {
      url: item.thumbs[maxInfo.urlKey] as string,
      width: maxInfo.width,
      height: maxInfo.height,
    };
  }
  return {
    url: '',
    width: 0,
    height: 0,
  };
}

export { getThumbnailURL, getMaxThumbnailURLInfo };
