/*
 * @Author: isaac.liu
 * @Date: 2019-01-14 09:57:24
 * Copyright © RingCentral. All rights reserved.
 */

const MIN_HEIGHT = 72;
const MIN_WIDTH = 180;
const MAX_WIDTHHEIGHT = 360;

function getThumbnailSize(
  width: number,
  height: number,
): { width: number; height: number } {
  const result = { width, height };
  if (typeof width === 'number' && typeof height === 'number') {
    const ratio = height / width;
    if (height <= MIN_HEIGHT && ratio >= 1 / 5 && ratio <= 2 / 5) {
      // case 1
      const scale = MIN_HEIGHT / height;
      result.width *= scale;
      result.height = MIN_HEIGHT;
    } else if (width <= MIN_WIDTH && ratio > 2 / 5 && ratio <= 2) {
      // case 2
      const scale = MIN_WIDTH / width;
      result.width = MIN_WIDTH;
      result.height *= scale;
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
        result.height *= scale;
      } else {
        const scale = MAX_WIDTHHEIGHT / height;
        result.width *= scale;
        result.height = MAX_WIDTHHEIGHT;
      }
    } else if (ratio < 1 / 5) {
      // case 5
      result.width = MAX_WIDTHHEIGHT;
      result.height = MIN_HEIGHT;
    } else if (ratio > 2) {
      // case 6
      result.height = MAX_WIDTHHEIGHT;
      result.width = MIN_WIDTH;
    }
  }
  return result;
}

export { getThumbnailSize };
