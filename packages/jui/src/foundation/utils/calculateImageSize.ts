/*
 * @Author: isaac.liu
 * @Date: 2019-01-14 09:57:24
 * Copyright © RingCentral. All rights reserved.
 */
import moize from 'moize';

const MIN_HEIGHT = 72;
const MIN_WIDTH = 180;
const MAX_WIDTHHEIGHT = 360;

type ThumbnailInfo = {
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
  top: number;
  left: number;
  justifyWidth: boolean;
  justifyHeight: boolean;
};

type CaseTye = {
  match: (width: number, height: number) => boolean;
  calculate: (width: number, height: number, result: ThumbnailInfo) => void;
};

const case1: CaseTye = {
  match(width: number, height: number) {
    const ratio = height / width;
    return height <= MIN_HEIGHT && ratio >= 1 / 5 && ratio <= 2 / 5;
  },
  calculate(width: number, height: number, result: ThumbnailInfo) {
    const scale = MIN_HEIGHT / height;
    result.width *= scale;
    result.height = MIN_HEIGHT;
    result.justifyHeight = true;
  },
};

const case2: CaseTye = {
  match(width: number, height: number) {
    const ratio = height / width;
    return width <= MIN_WIDTH && ratio > 2 / 5 && ratio <= 2;
  },
  calculate(width: number, height: number, result: ThumbnailInfo) {
    const scale = MIN_WIDTH / width;
    result.width = MIN_WIDTH;
    result.height *= scale;
    result.justifyWidth = true;
  },
};

const case3: CaseTye = {
  match(width: number, height: number) {
    return (
      width > MIN_WIDTH &&
      width <= MAX_WIDTHHEIGHT &&
      height > MIN_HEIGHT &&
      height <= MAX_WIDTHHEIGHT
    );
  },
  calculate() {
    // do nothing
  },
};

const case4: CaseTye = {
  match(width: number, height: number) {
    const ratio = height / width;
    return (
      (height > MAX_WIDTHHEIGHT || width > MAX_WIDTHHEIGHT) &&
      (ratio > 1 / 5 && ratio <= 2)
    );
  },
  calculate(width: number, height: number, result: ThumbnailInfo) {
    if (width < height) {
      result.width = (MAX_WIDTHHEIGHT * width) / height;
      result.height = MAX_WIDTHHEIGHT;
      result.justifyHeight = true;
    } else {
      result.width = MAX_WIDTHHEIGHT;
      result.height = (MAX_WIDTHHEIGHT * height) / width;
      result.justifyWidth = true;
    }
  },
};

const case5: CaseTye = {
  match(width: number, height: number) {
    const ratio = height / width;
    return ratio < 1 / 5;
  },
  calculate(width: number, height: number, result: ThumbnailInfo) {
    const ratio = height / width;
    result.width = MAX_WIDTHHEIGHT;
    result.height = MIN_HEIGHT;
    result.justifyHeight = true;
    result.left = (MAX_WIDTHHEIGHT - MIN_HEIGHT / ratio) / 2;
  },
};

const case6: CaseTye = {
  match(width: number, height: number) {
    const ratio = height / width;
    return ratio > 2;
  },
  calculate(width: number, height: number, result: ThumbnailInfo) {
    const ratio = height / width;
    result.height = MAX_WIDTHHEIGHT;
    result.width = MIN_WIDTH;
    result.justifyWidth = true;
    result.top = (MAX_WIDTHHEIGHT - MIN_WIDTH * ratio) / 2;
  },
};

const StrategyMap: CaseTye[] = [case1, case2, case3, case4, case5, case6];

function getThumbnailSizeInternal(
  width: number,
  height: number,
): ThumbnailInfo {
  const result = {
    width,
    height,
    imageWidth: width,
    imageHeight: height,
    top: 0,
    left: 0,
    justifyWidth: false,
    justifyHeight: false,
  };
  if (typeof width === 'number' && typeof height === 'number') {
    for (let i = 0; i < StrategyMap.length; ++i) {
      const item = StrategyMap[i];
      if (item.match(width, height)) {
        item.calculate(width, height, result);
        break;
      }
    }
  }
  result.width = Math.round(result.width);
  result.height = Math.round(result.height);
  result.left = Math.round(result.left);
  result.top = Math.round(result.top);
  result.imageWidth = Math.min(result.width + 2 * Math.abs(result.left), width);
  result.imageHeight = Math.min(
    result.height + 2 * Math.abs(result.top),
    height,
  );
  return result;
}

function getThumbnailForSquareSizeInternal(
  width: number,
  height: number,
  size: number,
): ThumbnailInfo {
  const result = {
    width,
    height,
    imageWidth: width,
    imageHeight: height,
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

const getThumbnailSize = moize(getThumbnailSizeInternal);
const getThumbnailForSquareSize = moize(getThumbnailForSquareSizeInternal);

export { getThumbnailSize, ThumbnailInfo, getThumbnailForSquareSize };
