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
import { debounce } from 'lodash';
import {
  JuiVirtualList,
  IVirtualListDataSource,
} from 'jui/pattern/VirtualList';
import { emptyView } from './Empty';

import {
  JuiRightShelfContent,
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
} from 'jui/pattern/RightShelf';
import { TAB_CONFIG, TabConfig } from './config';

@observer
class ItemListView extends React.Component<ViewProps & Props>
  implements IVirtualListDataSource {
  state = { loadingMore: false };
  private _fetchMore: any;
  private _config: TabConfig;
  constructor(props: ViewProps & Props) {
    super(props);
    this._fetchMore = debounce(this.props.fetchNextPageItems, 200);
    this._config = TAB_CONFIG.find(looper => looper.type === props.type)!;
  }
  countOfCell() {
    const { totalCount } = this.props;
    return totalCount;
  }

  cellAtIndex = (index: number, style: React.CSSProperties) => {
    const { ids } = this.props;
    const Component: any = this._config.item;
    const id = ids[index];
    if (id) {
      return (
        <div key={index} style={style}>
          <Component id={id} />
        </div>
      );
    }
    return <Fragment key={index} />;
  }

  fixedCellHeight() {
    return 52;
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
    this.setState({ loadingMore: true });
    const result = await this._fetchMore();
    this.setState({ loadingMore: false });
    return result;
  }

  onScroll = () => {};

  private _handleRetry = () => {};

  render() {
    const { totalCount, loading } = this.props;
    const { subheader } = this._config;
    const { loadingMore } = this.state;
    return (
      <JuiRightShelfContent>
        {loading && (
          <JuiRightRailContentLoading
            showTip={false}
            tip={t(this._config.tryAgainPrompt)}
            linkText={t('tryAgain')}
            onClick={this._handleRetry}
          />
        )}
        {totalCount > 0 && (
          <JuiListSubheader>
            {t(subheader)} ({this.props.totalCount})
          </JuiListSubheader>
        )}
        {totalCount > 0 && <JuiVirtualList dataSource={this} />}
        {loadingMore && <JuiRightRailLoadingMore />}
      </JuiRightShelfContent>
    );
  }
}

export { ItemListView };
