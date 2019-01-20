/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import React, { CSSProperties } from 'react';
import { observer } from 'mobx-react';
import { t } from 'i18next';
import { ViewProps, Props } from './types';
import { JuiListSubheader } from 'jui/components/Lists';
import {
  JuiInfiniteList,
  JuiVirtualCellWrapper,
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
    const { ids, loadStatus } = this.props;
    const { loading } = loadStatus;
    return loading ? ids.length + 1 : ids.length;
  }

  cellAtIndex = (index: number, style: CSSProperties) => {
    const { ids, tabConfig } = this.props;
    const Component: any = tabConfig.item;
    const id = ids[index];
    let content;
    if (id) {
      content = <Component id={id} />;
    }

    return (
      <JuiVirtualCellWrapper key={index} style={style}>
        {content}
      </JuiVirtualCellWrapper>
    );
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
    const { loadStatus, ids, totalCount } = this.props;
    const { firstLoaded } = loadStatus;
    console.log(211111, ids.length, totalCount);
    if (firstLoaded && ids.length === totalCount) {
      return;
    }
    await this.props.fetchNextPageItems();
  }

  firstLoader = () => {
    return <JuiRightRailContentLoading />;
  }

  moreLoader = () => {
    return <JuiRightRailLoadingMore />;
  }

  onScroll = () => {};

  private _handleRetry = async () => {
    return await this.loadMore(0, 0);
  }

  render() {
    const { totalCount, ids, loadStatus, tabConfig } = this.props;
    const { loading, firstLoaded, loadError } = loadStatus;
    const { subheader, tryAgainPrompt } = tabConfig;
    console.log(2111444, 'render', firstLoaded, loading, ids.length);
    return (
      <JuiRightShelfContent>
        {firstLoaded && totalCount > 0 && ids.length > 0 && (
          <JuiListSubheader>
            {t(subheader)} ({totalCount})
          </JuiListSubheader>
        )}
        {firstLoaded && (
          <JuiInfiniteList
            renderLoading={this.moreLoader}
            rowHeight={this.fixedCellHeight}
            threshold={1}
            cellCount={this.countOfCell()}
            isLoading={loading}
            loadMore={this.loadMore}
            renderRow={this.cellAtIndex}
            noRowsRenderer={this.renderEmptyContent}
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
