/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 17:16:07
 * Copyright © RingCentral. All rights reserved.
 */

import {
  JuiVirtualizedList,
  JuiVirtualizedListHandles,
} from 'jui/components/VirtualizedList';
import { JuiSizeDetector, Size } from 'jui/components/SizeDetector';
import { withTranslation, WithTranslation } from 'react-i18next';
import { HotKeys } from 'jui/hoc/HotKeys';
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { ItemListProps, ItemListViewProps } from './types';
import { SearchSectionsConfig } from '../config';
import { cacheEventFn } from '../types';
import { LIST_OUTTER_HEIGHT } from '../ContentSearchResult/constants';

const MAX_COUNT = 12;
const ITEM_HEIGHT = 40;
const FULLSCREEN_WIDTH = 640;

type Props = ItemListProps &
  ItemListViewProps &
  WithTranslation & { terms: string[] };

type State = {
  width?: number;
  height?: number;
};

@observer
class ItemListViewComponent extends Component<Props, State> {
  private [cacheEventFn._selectChangeMap]: Map<string, Function> = new Map();
  private [cacheEventFn._hoverHighlightMap]: Map<string, Function> = new Map();
  private _listRef: React.RefObject<
    JuiVirtualizedListHandles
  > = React.createRef();

  state: State = { width: 0, height: ITEM_HEIGHT * MAX_COUNT };

  private _cacheIndexPathFn = (type: cacheEventFn, index: number) => {
    const fnKey = `${index}`;
    const fnMap = this[type];
    if (!fnMap.get(fnKey)) {
      fnMap.set(fnKey, () => {
        this.props.setSelectIndex(index);
      });
    }
    return fnMap.get(fnKey);
  }

  hoverHighlight = (index: number) => {
    return this._cacheIndexPathFn(cacheEventFn._hoverHighlightMap, index);
  }

  // if search item removed need update selectIndex
  selectIndexChange = (index: number) => {
    return this._cacheIndexPathFn(cacheEventFn._selectChangeMap, index);
  }

  scrollToView = () => {
    const { selectIndex, startIndex, stopIndex, setRangeIndex } = this.props;
    if (
      (selectIndex < startIndex || selectIndex >= stopIndex) &&
      this._listRef.current
    ) {
      this._listRef.current.scrollToIndex(selectIndex);
      setRangeIndex({
        startIndex: selectIndex,
        stopIndex: selectIndex + MAX_COUNT,
      });
    }
  }

  onKeyUp = () => {
    const { onKeyUp } = this.props;
    onKeyUp();
    this.scrollToView();
  }

  onKeyDown = () => {
    const { onKeyDown, list } = this.props;
    onKeyDown(list);
    this.scrollToView();
  }

  onEnter = (evt: KeyboardEvent) => {
    const { onEnter, list, type } = this.props;
    onEnter(evt, list, type);
    this.scrollToView();
  }

  createSearchItem = (config: {
    id: number | string;
    index: number;
    type: string;
  }) => {
    const { selectIndex, resetSelectIndex } = this.props;
    const { id, type, index } = config;

    const { Item, title } = SearchSectionsConfig[type];
    const hovered = index === selectIndex;

    return (
      <Item
        hovered={hovered}
        onMouseEnter={this.hoverHighlight(index)}
        onMouseLeave={resetSelectIndex}
        title={title}
        didChange={this.selectIndexChange(index)}
        id={id}
        key={id}
      />
    );
  }

  private _handleSizeUpdate = (size: Size) => {
    const width = size.width;
    let height = size.height;
    if (size.width < FULLSCREEN_WIDTH) {
      height = size.height - LIST_OUTTER_HEIGHT;
    } else {
      height = Math.min(
        ITEM_HEIGHT * Math.min(MAX_COUNT, this.props.list.length),
        size.height - LIST_OUTTER_HEIGHT,
      );
    }
    if (height !== this.state.height || width !== this.state.width) {
      this.setState({ height, width });
    }
  }

  render() {
    const { type, setRangeIndex, list } = this.props;

    if (!type) {
      return null;
    }

    return (
      <HotKeys
        keyMap={{
          up: this.onKeyUp,
          down: this.onKeyDown,
          enter: this.onEnter,
        }}
      >
        <JuiSizeDetector handleSizeChanged={this._handleSizeUpdate} />
        <JuiVirtualizedList
          height={this.state.height as number}
          minRowHeight={ITEM_HEIGHT}
          ref={this._listRef}
          onVisibleRangeChange={setRangeIndex}
        >
          {list.map((id: number, index: number) => {
            return this.createSearchItem({
              id,
              type,
              index,
            });
          })}
        </JuiVirtualizedList>
      </HotKeys>
    );
  }
}

const ItemListView = withTranslation('translations')(ItemListViewComponent);

export { ItemListView };
