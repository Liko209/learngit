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
} from 'jui/components/VirtualizedList';
import { QUERY_DIRECTION } from 'sdk/dao';
import { action } from 'mobx';
import { observer } from 'mobx-react';

type DataListProps = {
  listHandler: FetchSortableDataListHandler<any, any>;
  initialDataCount: number;
  InfiniteListProps: Pick<
    JuiInfiniteListProps,
    | 'height'
    | 'minRowHeight'
    | 'overscan'
    | 'loadingRenderer'
    | 'loadingMoreRenderer'
    | 'noRowsRenderer'
    | 'loadMoreStrategy'
    | 'stickToLastPosition'
  >;
  children: JSX.Element[];
  reverse?: boolean;
};

@observer
class DataList extends React.Component<DataListProps> {
  @action
  private _loadInitialData = async () => {
    // TODO support up=>down and down=>up
    await this.props.listHandler.fetchData(
      this._transformDirection('down'),
      this.props.initialDataCount,
    );
    this.props.listHandler.setHasMore(false, this._transformDirection('up'));
  }

  @action
  private _loadMore = async (direction: 'up' | 'down', count: number) => {
    await this.props.listHandler.fetchData(
      this._transformDirection(direction),
      count,
    );
  }

  @action
  private _hasMore = (direction: 'up' | 'down') => {
    return this.props.listHandler.hasMore(this._transformDirection(direction));
  }

  private _transformDirection(direction: 'up' | 'down') {
    if (this.props.reverse) {
      return direction === 'up' ? QUERY_DIRECTION.OLDER : QUERY_DIRECTION.NEWER;
    }
    return direction === 'up' ? QUERY_DIRECTION.NEWER : QUERY_DIRECTION.OLDER;
  }

  componentDidUpdate(prevProps: DataListProps) {
    if (this.props.listHandler !== prevProps.listHandler) {
      this._loadInitialData();
    }
  }

  render() {
    const { children, InfiniteListProps } = this.props;
    return (
      <JuiInfiniteList
        loadInitialData={this._loadInitialData}
        loadMore={this._loadMore}
        hasMore={this._hasMore}
        {...InfiniteListProps}
      >
        {children}
      </JuiInfiniteList>
    );
  }
}

export { DataList, DataListProps };
