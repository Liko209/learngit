/*
 * @Author: isaac.liu
 * @Date: 2019-01-14 09:57:24
 * Copyright © RingCentral. All rights reserved.
 */

const MIN_HEIGHT = 72;
const MIN_WIDTH = 180;
const MAX_WIDTHHEIGHT = 360;

type ThumbnailInfo = {
  width: number;
  height: number;
  top: number;
  left: number;
  justifyWidth: boolean;
  justifyHeight: boolean;
};

function getThumbnailSize(width: number, height: number): ThumbnailInfo {
  const result = {
    width,
    height,
    top: 0,
    left: 0,
    justifyWidth: false,
    justifyHeight: false,
  };
  if (typeof width === 'number' && typeof height === 'number') {
    const ratio = height / width;
    if (height <= MIN_HEIGHT && ratio >= 1 / 5 && ratio <= 2 / 5) {
      // case 1
      const scale = MIN_HEIGHT / height;
      result.width *= scale;
      result.height = MIN_HEIGHT;
      result.justifyHeight = true;
    } else if (width <= MIN_WIDTH && ratio > 2 / 5 && ratio <= 2) {
      // case 2
      const scale = MIN_WIDTH / width;
      result.width = MIN_WIDTH;
      result.height *= scale;
      result.justifyWidth = true;
    } else if (
      width > MIN_WIDTH &&
      width <= MAX_WIDTHHEIGHT &&
      height > MIN_HEIGHT &&
      height <= MAX_WIDTHHEIGHT
    ) {
      // case 3, perfect image
    } else if (
      height > MAX_WIDTHHEIGHT &&
      width > MAX_WIDTHHEIGHT &&
      ratio > 1 / 5 &&
      ratio < 2
    ) {
      // case 4
      if (width < height) {
        const scale = MAX_WIDTHHEIGHT / width;
        result.width = MAX_WIDTHHEIGHT;
        result.height = MAX_WIDTHHEIGHT;
        result.justifyWidth = true;
        result.top = (MAX_WIDTHHEIGHT - height * scale) / 2;
      } else {
        const scale = MAX_WIDTHHEIGHT / height;
        result.width = MAX_WIDTHHEIGHT;
        result.height = MAX_WIDTHHEIGHT;
        result.justifyHeight = true;
        result.left = (MAX_WIDTHHEIGHT - width * scale) / 2;
      }
    } else if (ratio < 1 / 5) {
      // case 5
      result.width = MAX_WIDTHHEIGHT;
      result.height = MIN_HEIGHT;
      result.justifyHeight = true;
      result.left = (MAX_WIDTHHEIGHT - MIN_HEIGHT / ratio) / 2;
    } else if (ratio > 2) {
      // case 6
      result.height = MAX_WIDTHHEIGHT;
      result.width = MIN_WIDTH;
      result.justifyWidth = true;
      result.top = (MAX_WIDTHHEIGHT - MIN_WIDTH * ratio) / 2;
    }
  }
  result.width = Math.round(result.width);
  result.height = Math.round(result.height);
  result.left = Math.round(result.left);
  result.top = Math.round(result.top);
  return result;
}

function getThumbnailForSquareSize(
  width: number,
  height: number,
  size: number,
): ThumbnailInfo {
  const result = {
    width,
    height,
    top: 0,
    left: 0,
    justifyWidth: false,
    justifyHeight: false,
  };
  if (typeof width === 'number' && typeof height === 'number') {
    const ratio = height / width;
    if (ratio > 1) {
      result.width = size;
      result.height = size;
      result.top = Math.round((size * (1 - ratio)) / 2);
      result.justifyWidth = true;
    } else {
      result.width = size;
      result.height = size;
      result.left = Math.round((size * (1 - 1 / ratio)) / 2);
      result.justifyHeight = true;
    }
  }
  return result;
}

export { getThumbnailSize, ThumbnailInfo, getThumbnailForSquareSize };
