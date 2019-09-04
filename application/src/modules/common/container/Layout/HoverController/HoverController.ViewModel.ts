/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-04 18:16:51
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';

const InvalidIndexPath: number = -1;

const DefaultIndexPath: number = -1;

class HoverControllerViewModel<T> extends StoreViewModel<T> {
  private cacheMap: Map<string, Function> = new Map();

  @observable selectIndex: number = DefaultIndexPath;

  @action
  updateCacheIndex = (cellIndex: number) => {
    const fnKey = cellIndex.toString();
    if (!this.cacheMap.get(fnKey)) {
      this.cacheMap.set(fnKey, () => {
        this.setSelectIndex(cellIndex);
      });
    }
    return this.cacheMap.get(fnKey);
  };

  @action
  setSelectIndex = (cellIndex: number) => {
    this.selectIndex = cellIndex;
  };

  @action
  resetSelectIndex = () => {
    this.selectIndex = InvalidIndexPath;
  };

  @action
  setSelectIndexToDefault = () => {
    this.selectIndex = DefaultIndexPath;
  };

  @action
  selectIndexChange = (cellIndex: number) => this.updateCacheIndex(cellIndex);

  @action
  isHover = (cellIndex: number) => cellIndex === this.selectIndex;
}

type HoverControllerBaseProps = {
  resetSelectIndex: () => void;
  isHover: (cellIndex: number) => boolean;
  selectIndexChange: (cellIndex: number) => () => void;
  selectIndex: number[];
};

type HoverControllerBaseViewProps = {
  isHover: boolean;
  onMouseLeave: () => void;
  onMouseOver: () => void;
};

export {
  HoverControllerViewModel,
  HoverControllerBaseProps,
  HoverControllerBaseViewProps,
  InvalidIndexPath,
  DefaultIndexPath,
};
