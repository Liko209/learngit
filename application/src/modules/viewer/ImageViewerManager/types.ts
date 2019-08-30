/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-10 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { Item } from 'sdk/module/item/entity';
import { QUERY_DIRECTION } from 'sdk/dao';
import { VIEWER_ITEM_TYPE } from './constants';

type ImageViewerViewModuleProps = {
  groupId: number;
  itemId: number; // imageId || fileId || otherItemId
  isNavigation?: boolean;
  postId?: number;
  type: VIEWER_ITEM_TYPE;
  initialOptions: ImageViewerOptions;
  dismiss: () => void;
};

type SingleImageViewerViewModuleProps = {
  titleName: string;
  url: string;
  dismiss: () => void;
};

type ImageViewerViewModule = {
  init: () => void;
  currentItemId: number;
  currentIndex: number;
  getCurrentItemId: () => number;
  getCurrentIndex: () => number;
  total: number;
  ids: number[];
  updateCurrentItemIndex: (index: number, itemId: number) => void;

  hasPrevious: boolean;
  hasNext: boolean;
  switchToPrevious: () => void;
  switchToNext: () => void;
  stopPreload: () => void;
  loadMore: (direction: QUERY_DIRECTION) => Promise<Item[] | null>;
  setOnCurrentItemDeletedCb: (callback: (nextItemId: number) => void) => void;
  setOnItemSwitchCb: (callback: (itemId: number) => void) => void;
  deleteItem?: boolean;
  onContentLoad?: () => void;
  onContentError?: () => void;

  originElement?: HTMLElement;
  imageWidth?: number;
  imageHeight?: number;
  thumbnailSrc?: string;
};

type ImageViewerOptions = {
  originElement?: HTMLElement;
  thumbnailSrc?: string;
  initialWidth?: number;
  initialHeight?: number;
};
type ImageViewerProps = ImageViewerViewModule & {
  thumbnailSrc?: string;
};

type ImageViewerBuild = {
  groupId: number;
  imageId: number;
  initialOptions: ImageViewerOptions;
  mode?: string;
  postId?: number;
};

export {
  ImageViewerViewModuleProps,
  ImageViewerViewModule,
  ImageViewerProps,
  ImageViewerOptions,
  ImageViewerBuild,
  SingleImageViewerViewModuleProps,
};
