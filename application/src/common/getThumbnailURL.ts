/*
 * @Author: isaac.liu
 * @Date: 2019-02-15 08:26:10
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import FileItemModel from '@/store/models/FileItem';
import { getThumbnailSize } from 'jui/foundation/utils';
import {
  RULE,
  generateModifiedImageURL,
} from '@/common/generateModifiedImageURL';
import { ItemService } from 'sdk/module/item/service';
import { FileItemUtils } from 'sdk/module/item/module/file/utils';
import { ItemVersions } from 'sdk/src/module/item/entity';

enum IMAGE_TYPE {
  THUMBNAIL_IMAGE,
  MODIFY_IMAGE,
  ORIGINAL_IMAGE,
  UNKNOWN_IMAGE,
}

type ImageInfo = {
  id: number;
  type: string;
  versionUrl: string;
  versions: ItemVersions[];
};

const SQUARE_SIZE = 180;

function getThumbnailURL(
  item: ImageInfo,
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

function hasVersions(versions: ItemVersions[]) {
  return versions && versions.length > 0;
}

function getVersionsValue(versions: ItemVersions[], type: string) {
  return versions[0][type];
}

function getOrigHeight(versions: ItemVersions[]) {
  return hasVersions(versions)
    ? getVersionsValue(versions, 'orig_height')
    : null;
}

function getOrigWidth(versions: ItemVersions[]) {
  return hasVersions(versions)
    ? getVersionsValue(versions, 'orig_width')
    : null;
}

async function getThumbnailURLWithType(
  item: ImageInfo,
  rule: RULE,
): Promise<{ url: string; type: IMAGE_TYPE }> {
  if (item.id < 0) {
    return { url: '', type: IMAGE_TYPE.UNKNOWN_IMAGE };
  }
  const { id, type, versionUrl, versions } = item;
  const origWidth = getOrigWidth(versions);
  const origHeight = getOrigHeight(versions);
  let url = '';
  if (!type) {
    return { url, type: IMAGE_TYPE.UNKNOWN_IMAGE };
  }
  // Notes
  // 1. There is no thumbnail for the image just uploaded.
  // 2. tif has thumbnail field.
  // 3. gif use original url.
  if (FileItemUtils.isGifItem({ type })) {
    url = versionUrl || '';
    return { url, type: IMAGE_TYPE.ORIGINAL_IMAGE };
  }

  if (rule === RULE.SQUARE_IMAGE) {
    url = getThumbnailURL(item, {
      width: SQUARE_SIZE,
      height: SQUARE_SIZE,
    });

    if (url && url.length) {
      return {
        url,
        type: IMAGE_TYPE.THUMBNAIL_IMAGE,
      };
    }

    if (!url && FileItemUtils.isSupportPreview({ type })) {
      const itemService = ItemService.getInstance() as ItemService;
      url = await itemService.getThumbsUrlWithSize(
        id,
        SQUARE_SIZE,
        SQUARE_SIZE,
      );
      return { url, type: IMAGE_TYPE.MODIFY_IMAGE };
    }
  } else {
    const size = getThumbnailSize(origWidth, origHeight);
    url = getThumbnailURL(item, {
      width: size.imageWidth,
      height: size.imageHeight,
    });

    if (url && url.length) {
      return {
        url,
        type: IMAGE_TYPE.THUMBNAIL_IMAGE,
      };
    }

    if (
      !url &&
      origWidth > 0 &&
      origHeight > 0 &&
      FileItemUtils.isSupportPreview({ type })
    ) {
      const result = await generateModifiedImageURL({
        rule,
        origHeight,
        origWidth,
        id,
        squareSize: SQUARE_SIZE,
      });
      url = result.url;
      return { url, type: IMAGE_TYPE.MODIFY_IMAGE };
    }
  }

  if (!url) {
    url = versionUrl || '';
    return { url, type: IMAGE_TYPE.ORIGINAL_IMAGE };
  }
  return { url, type: IMAGE_TYPE.UNKNOWN_IMAGE };
}

function getMaxThumbnailURLInfo(item: FileItemModel) {
  if (item.thumbs && item.storeFileId) {
    const urlKeys = Object.keys(item.thumbs).filter((key: string) =>
      key.startsWith(`${item.storeFileId}`),
    );
    // {storeFileId}[size={width}x{height}] size info is option
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
      const widthHeightInfo = urlKey.split('=')[1];
      if (widthHeightInfo) {
        // width-{storeFileId}size={width}x{height}
        // height-{storeFileId}size={width}x{height}
        const [width, height] = widthHeightInfo.split('x').map(Number);
        const realWidth = toNumber(item.thumbs![getWidthKey(width, height)]);
        const realHeight = toNumber(item.thumbs![getHeightKey(width, height)]);
        if (maxInfo.width * maxInfo.height < realWidth * realHeight) {
          maxInfo.urlKey = urlKey;
          maxInfo.width = realWidth;
          maxInfo.height = realHeight;
        }
      } else {
        maxInfo.urlKey = urlKey;
        maxInfo.width = item.origWidth;
        maxInfo.height = item.origHeight;
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

export {
  getThumbnailURL,
  getMaxThumbnailURLInfo,
  getThumbnailURLWithType,
  IMAGE_TYPE,
  ImageInfo,
  SQUARE_SIZE,
};
