/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Fragment } from 'react';
import { observer } from 'mobx-react';
import { t } from 'i18next';
import { ViewProps, Props } from './types';
import { JuiListSubheader } from 'jui/components/Lists';
// import { debounce } from 'lodash';
import {
  // JuiVirtualList,
  // IVirtualListDataSource,
  // JuiVirtualListLoader,
  JuiVirtualLoadList,
} from 'jui/pattern/VirtualList';
import { emptyView } from './Empty';

import {
  JuiRightShelfContent,
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
  JuiRightRailContentLoadError,
} from 'jui/pattern/RightShelf';

@observer
class ItemListView extends React.Component<ViewProps & Props> {
  async componentDidMount() {
    await this.loadMore(0, 0);
  }

  countOfCell() {
    const { totalCount, loading } = this.props;
    return loading ? totalCount + 1 : totalCount; // this.props.loading ? ids.length + 1 : ids.length;
  }

  cellAtIndex = (index: number) => {
    const { ids, tabConfig } = this.props;
    const Component: any = tabConfig.item;
    const id = ids[index];
    if (id) {
      return <Component id={id} />;
    }
    console.log(21111115, index, ids.length);
    if (index === ids.length) {
      return <JuiRightRailLoadingMore key={index} />;
    }
    return <Fragment key={index} />;
  }

  fixedCellHeight() {
    return 52;
  }

  overscanCount() {
    return 0;
  }

  renderEmptyContent = () => {
    const { type } = this.props;
    return emptyView(type);
  }

  isRowLoaded = (index: number) => {
    const { ids } = this.props;
    const result = typeof ids[index] !== 'undefined';
    return result;
  }

  loadMore = async (startIndex: number, stopIndex: number) => {
    const result = await this.props.fetchNextPageItems();
    return result;
  }

  firstLoader = () => {
    return <JuiRightRailContentLoading />;
  }

  isEmptyList = () => {
    const { totalCount } = this.props;
    return totalCount === 0;
  }

  moreLoader = () => {
    return <JuiRightRailLoadingMore />;
  }

  onScroll = () => {};

  private _handleRetry = async () => {
    return await this.loadMore(0, 0);
  }

  render() {
    const {
      totalCount,
      ids,
      firstLoaded,
      loadError,
      loading,
      tabConfig,
    } = this.props;
    const { subheader, tryAgainPrompt } = tabConfig;
    const hasNextPage = ids.length < totalCount;
    console.log(21111, ids.length, totalCount, loading);
    return (
      <JuiRightShelfContent>
        {firstLoaded && ids.length > 0 && (
          <JuiListSubheader>
            {t(subheader)} ({totalCount})
          </JuiListSubheader>
        )}
        {firstLoaded && (
          <JuiVirtualLoadList
            list={ids}
            hasNextPage={hasNextPage}
            isNextPageLoading={loading}
            loadNextPage={this.loadMore}
            renderCell={this.cellAtIndex}
            moreLoader={this.moreLoader}
            rowHeight={this.fixedCellHeight()}
          />
        )}
        {loading && !firstLoaded && this.firstLoader()}
        {loadError && (
          <JuiRightRailContentLoadError
            tip={t(tryAgainPrompt)}
            linkText={t('tryAgain')}
            onClick={this._handleRetry}
          />
        )}
      </JuiRightShelfContent>
    );
  }
}

export { ItemListView };
