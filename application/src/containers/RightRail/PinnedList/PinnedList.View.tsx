/*
 * @Author: isaac.liu
 * @Date: 2019-02-02 13:53:40
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import i18next from 'i18next';
import { PinnedListViewProps, PinnedListProps } from './types';
import { JuiListSubheader } from 'jui/components/Lists';

import {
  JuiInfiniteList,
  ThresholdStrategy,
} from 'jui/components/VirtualizedList';

import {
  JuiRightShelfContent,
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
} from 'jui/pattern/RightShelf';
import { PinnedCell } from './PinnedCell';
import { emptyView } from '../ItemList/Empty';
import { RIGHT_RAIL_ITEM_TYPE } from '../ItemList';
import {
  LOAD_MORE_STRATEGY_CONFIG,
  HEADER_HEIGHT,
  PINED_ITEM_HEIGHT,
} from '../constants';

@observer
class PinnedListView extends React.Component<
  PinnedListViewProps & PinnedListProps
> {
  private _loadMoreStrategy = new ThresholdStrategy(LOAD_MORE_STRATEGY_CONFIG);
  private _renderItems = () => {
    return this.props.ids.map((itemId: number) => (
      <PinnedCell id={itemId} key={itemId} />
    ));
  }

  renderEmptyContent = () => {
    return emptyView(RIGHT_RAIL_ITEM_TYPE.PIN_POSTS);
  }

  hasMore = (direction: string) => {
    if (direction === 'up') {
      return false;
    }
    const { ids, totalCount } = this.props;
    return ids.length !== totalCount;
  }

  defaultLoading = () => {
    return <JuiRightRailContentLoading />;
  }

  defaultLoadingMore = () => {
    return <JuiRightRailLoadingMore />;
  }

  render() {
    const { totalCount, ids, height } = this.props;
    return (
      <JuiRightShelfContent>
        {totalCount > 0 && ids.length > 0 && (
          <JuiListSubheader data-test-automation-id="rightRail-list-subtitle">
            {i18next.t('item.pinnedListSubheader')}
          </JuiListSubheader>
        )}
        {totalCount === 0 && this.renderEmptyContent()}
        {totalCount > 0 && (
          <JuiInfiniteList
            height={height - HEADER_HEIGHT}
            minRowHeight={PINED_ITEM_HEIGHT}
            loadMoreStrategy={this._loadMoreStrategy}
            loadInitialData={this.props.loadInitialData}
            loadMore={this.props.loadMore}
            loadingRenderer={this.defaultLoading()}
            hasMore={this.hasMore}
            loadingMoreRenderer={this.defaultLoadingMore()}
            noRowsRenderer={this.renderEmptyContent()}
            stickToLastPosition={false}
          >
            {this._renderItems()}
          </JuiInfiniteList>
        )}
      </JuiRightShelfContent>
    );
  }
}

export { PinnedListView };
