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
  state = { loading: false };
  private _updateStateTimer: NodeJS.Timeout | null;
  async componentDidMount() {
    await this.loadMore(0, 0);
  }

  componentWillUnmount() {
    if (this._updateStateTimer) {
      clearTimeout(this._updateStateTimer);
      this._updateStateTimer = null;
    }
  }

  countOfCell() {
    const { ids } = this.props;
    const { loading } = this.state;
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

  private _clearTimer = () => {
    if (this._updateStateTimer) {
      clearTimeout(this._updateStateTimer);
      this._updateStateTimer = null;
    }
  }

  loadMore = async (startIndex: number, stopIndex: number) => {
    const { firstLoaded, ids, totalCount } = this.props;
    if (firstLoaded && ids.length === totalCount) {
      return;
    }
    const p = new Promise((resolve: any) => {
      this.setState({ loading: true }, () => {
        this.props.fetchNextPageItems().then((result: any) => {
          resolve(result);
          this._updateStateTimer = setTimeout(() => {
            this.setState({ loading: false });
            this._clearTimer();
          },                                  0);
        });
      });
    }).catch((error: Error) => {
      this._clearTimer();
    });
    const result = await p;
    return result;
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
    const { totalCount, ids, firstLoaded, loadError, tabConfig } = this.props;
    const { loading } = this.state;
    const { subheader, tryAgainPrompt } = tabConfig;
    console.log(2111444, 'render');
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
