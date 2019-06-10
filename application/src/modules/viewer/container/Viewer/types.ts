/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-26 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactElement } from 'react';
import { Item } from 'sdk/module/item/entity';
import { QUERY_DIRECTION } from 'sdk/dao';
import { VIEWER_ITEM_TYPE } from './constants';

type CommonProps = {
  groupId: number;
  itemId: number; // imageId || fileId || otherItemId
  isNavigation?: boolean;
  postId?: number;
  type: VIEWER_ITEM_TYPE;
};

type ViewerViewModelProps = CommonProps & {
  init: () => Promise<void>;
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
  loadMore: (direction: QUERY_DIRECTION) => Promise<Item[]>;
  setOnCurrentItemDeletedCb: (callback: (nextItemId: number) => void) => void;
  setOnItemSwitchCb: (callback: (itemId: number) => void) => void;
  deleteItem?: boolean;
};

type ViewerViewProps = CommonProps & {
  contentLeftRender: (props: ViewerViewModelProps) => ReactElement;
  viewerDestroyer: Function;
};

export { ViewerViewModelProps, ViewerViewProps };
