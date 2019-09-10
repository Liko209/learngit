/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-04-23 18:18:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { FetchSortableDataListHandler } from '@/store/base/fetch';
import {
  JuiInfiniteListProps,
  JuiInfiniteList,
  JuiVirtualizedListHandles,
} from 'jui/components/VirtualizedList';
import { QUERY_DIRECTION } from 'sdk/dao';
import { action, computed } from 'mobx';
import { observer } from 'mobx-react';

type DataListProps = {
  listHandler: FetchSortableDataListHandler<any, any>;
  initialDataCount: number;
  InfiniteListProps: Pick<
    JuiInfiniteListProps,
    | 'initialScrollToIndex'
    | 'height'
    | 'minRowHeight'
    | 'overscan'
    | 'loadingRenderer'
    | 'loadingMoreRenderer'
    | 'noRowsRenderer'
    | 'loadMoreStrategy'
    | 'stickToLastPosition'
  > & { ref?: React.RefObject<JuiVirtualizedListHandles> };
  children: JSX.Element[];
  reverse?: boolean;
};

@observer
class DataList extends React.Component<DataListProps> {
  componentDidUpdate(prevProps: DataListProps) {
    if (this.props.listHandler !== prevProps.listHandler) {
      this._loadInitialData();
    }
  }

  componentWillUnmount() {
    this.props.listHandler.dispose();
  }

  @computed
  get hasMore() {
    // Collect mobx dependency for hasMore up and down
    this.props.listHandler.hasMore(this._transformDirection('up'));
    this.props.listHandler.hasMore(this._transformDirection('down'));
    return (direction: 'up' | 'down') =>
      this.props.listHandler.hasMore(this._transformDirection(direction));
  }

  @action
  private _loadInitialData = async () => {
    // TODO support up=>down and down=>up
    await this.props.listHandler.fetchData(
      this._transformDirection('down'),
      this.props.initialDataCount,
    );
    this.props.listHandler.setHasMore(false, this._transformDirection('up'));
  };

  @action
  loadMore = async (direction: 'up' | 'down', count: number) => {
    await this.props.listHandler.fetchData(
      this._transformDirection(direction),
      count,
    );
  };

  private _transformDirection(direction: 'up' | 'down') {
    if (this.props.reverse) {
      return direction === 'up' ? QUERY_DIRECTION.OLDER : QUERY_DIRECTION.NEWER;
    }
    return direction === 'up' ? QUERY_DIRECTION.NEWER : QUERY_DIRECTION.OLDER;
  }

  render() {
    const { children, InfiniteListProps } = this.props;

    return (
      <JuiInfiniteList
        loadInitialData={this._loadInitialData}
        loadMore={this.loadMore}
        hasMore={this.hasMore}
        {...InfiniteListProps}
      >
        {children}
      </JuiInfiniteList>
    );
  }
}

export { DataList, DataListProps };
