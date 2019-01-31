/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-29 10:47:30
 * Copyright © RingCentral. All rights reserved.
 */

import {
  ThumbnailInfo,
  getThumbnailSize as rectangle,
  getThumbnailForSquareSize as square,
} from 'jui/foundation/utils/calculateImageSize';
import { ItemService } from 'sdk/module/item/service';

enum RULE {
  SQUARE_IMAGE,
  RECTANGLE_IMAGE,
}

type Request = {
  id: number; // item id
  origWidth: number;
  origHeight: number;
  rule: RULE;
  squareSize?: number;
};

type Result = ThumbnailInfo & {
  url: string;
};

const getThumbnail = async ({
  id,
  origWidth,
  origHeight,
  rule,
  squareSize = 36,
}: Request): Promise<Result> => {
  let result: Result = {
    width: origWidth,
    height: origHeight,
    top: 0,
    left: 0,
    justifyWidth: false,
    justifyHeight: false,
    url: '',
  };
  // calculate image size
  switch (rule) {
    case RULE.SQUARE_IMAGE:
      result = {
        ...result,
        ...square(origWidth, origHeight, squareSize),
      };
      break;
    case RULE.RECTANGLE_IMAGE:
      result = { ...result, ...rectangle(origWidth, origHeight) };
      break;
    default:
      break;
  }
  // fetch crop image url
  const { width, height } = result;
  if (width > 0 && height > 0) {
    const itemService = ItemService.getInstance() as ItemService;
    result.url = await itemService.getThumbsUrlWithSize(id, width, height);
  }
  return result;
};

export { getThumbnail, RULE, Result };
