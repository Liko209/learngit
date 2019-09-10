/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-01 17:16:07
 * Copyright © RingCentral. All rights reserved.
 */
import {
  JuiVirtualizedListHandles,
  ThresholdStrategy,
} from 'jui/components/VirtualizedList';
import { withTranslation, WithTranslation } from 'react-i18next';
import { HotKeys } from 'jui/hoc/HotKeys';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { DataList } from '@/modules/common/container/DataList';
import {
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
} from 'jui/pattern/RightShelf';

import { ItemListProps, ItemListViewProps } from './types';
import { SearchSectionsConfig } from '../config';
import { cacheEventFn } from '../types';

import { PerformanceTracer } from 'foundation/performance';
import { GLOBAL_SEARCH_PERFORMANCE_KEYS } from '../../performanceKeys';
import {
  INITIAL_DATA_COUNT,
  MAX_COUNT,
  ITEM_HEIGHT,
  MAX_HEIGHT,
  LOADING_DELAY,
} from './config';

type Props = ItemListProps &
  ItemListViewProps &
  WithTranslation & { terms: string[] };

@observer
class ItemListViewComponent extends Component<Props> {
  private _infiniteListProps = {
    height: MAX_HEIGHT,
    fixedRowHeight: ITEM_HEIGHT,
    loadingRenderer: () => <JuiRightRailContentLoading delay={LOADING_DELAY} />,
    loadingMoreRenderer: () => <JuiRightRailLoadingMore />,
    stickToLastPosition: false,
    loadMoreStrategy: new ThresholdStrategy({
      threshold: 40,
      minBatchCount: 10,
    }),
  };
  private _keyMap = {};
  private [cacheEventFn._selectChangeMap]: Map<string, Function> = new Map();
  private [cacheEventFn._hoverHighlightMap]: Map<string, Function> = new Map();
  private _listRef: React.RefObject<
    JuiVirtualizedListHandles
  > = React.createRef();
  private _dataList = React.createRef<DataList>();
  private _performanceTracer: PerformanceTracer = PerformanceTracer.start();

  constructor(props: Props) {
    super(props);

    this._keyMap = {
      up: this.onKeyUp,
      down: this.onKeyDown,
      enter: this.onEnter,
    };
  }

  private _cacheIndexPathFn = (type: cacheEventFn, index: number) => {
    const fnKey = `${index}`;
    const fnMap = this[type];
    if (!fnMap.get(fnKey)) {
      fnMap.set(fnKey, () => {
        this.props.setSelectIndex(index);
      });
    }
    return fnMap.get(fnKey);
  };

  hoverHighlight = (index: number) =>
    this._cacheIndexPathFn(cacheEventFn._hoverHighlightMap, index);

  // if search item removed need update selectIndex
  selectIndexChange = (index: number) =>
    this._cacheIndexPathFn(cacheEventFn._selectChangeMap, index);

  scrollToView = () => {
    const { selectIndex, startIndex, stopIndex, setRangeIndex } = this.props;
    if (selectIndex >= stopIndex) {
      this._dataList.current &&
        this._dataList.current.loadMore('down', MAX_COUNT);
    }

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
  };

  onKeyUp = () => {
    const { onKeyUp } = this.props;
    onKeyUp();
    this.scrollToView();
  };

  onKeyDown = () => {
    const { onKeyDown, ids } = this.props;
    onKeyDown(ids);
    this.scrollToView();
  };

  onEnter = (evt: KeyboardEvent) => {
    const { onEnter, ids, type } = this.props;
    onEnter(evt, ids, type);
    this.scrollToView();
  };

  createSearchItem = (config: { id: number; index: number; type: string }) => {
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
        analysisSource="fullSearchResultsPage"
        dataTrackingDomain="fullSearch"
      />
    );
  };

  componentDidUpdate() {
    this._performanceTracer.end({
      key: GLOBAL_SEARCH_PERFORMANCE_KEYS.UI_GLOBALSEARCH_TAB_RENDER,
      count: this.props.ids.length,
    });
  }

  private _renderItems() {
    const { listHandler, type } = this.props;
    return listHandler.sortableListStore.getIds.map(
      (id: number, index: number) =>
        this.createSearchItem({
          id,
          type,
          index,
        }),
    );
  }

  render() {
    const { type, setRangeIndex, listHandler } = this.props;
    if (!type) {
      return null;
    }

    return (
      <HotKeys keyMap={this._keyMap} global>
        <DataList
          ref={this._dataList}
          initialDataCount={INITIAL_DATA_COUNT}
          listHandler={listHandler}
          reverse
          InfiniteListProps={Object.assign(this._infiniteListProps, {
            ref: this._listRef,
            onVisibleRangeChange: setRangeIndex,
          })}
        >
          {this._renderItems()}
        </DataList>
      </HotKeys>
    );
  }
}

const ItemListView = withTranslation('translations')(ItemListViewComponent);

export { ItemListView };
