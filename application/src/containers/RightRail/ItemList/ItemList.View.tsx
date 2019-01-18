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
  JuiVirtualList,
  IVirtualListDataSource,
  // JuiVirtualListLoader,
} from 'jui/pattern/VirtualList';
import { emptyView } from './Empty';

import {
  JuiRightShelfContent,
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
} from 'jui/pattern/RightShelf';
import { TAB_CONFIG, TabConfig } from './config';

async function delay(time: number) {
  return new Promise((resolve: Function) => {
    setTimeout(resolve, time);
  });
}

@observer
class ItemListView extends React.Component<ViewProps & Props>
  implements IVirtualListDataSource {
  private _config: TabConfig;
  constructor(props: ViewProps & Props) {
    super(props);
    this._config = TAB_CONFIG.find(looper => looper.type === props.type)!;
  }

  async componentDidMount() {
    await this.loadMore(0, 0);
  }

  countOfCell() {
    const { ids } = this.props;
    return this.props.loading ? ids.length + 1 : ids.length;
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
    await delay(5);
    return result;
  }

  firstLoader = () => {
    return (
      <JuiRightRailContentLoading
        showTip={false}
        tip={t(this._config.tryAgainPrompt)}
        linkText={t('tryAgain')}
        onClick={this._handleRetry}
      />
    );
  }

  isEmptyList = () => {
    const { totalCount } = this.props;
    return totalCount === 0;
  }

  moreLoader = () => {
    return <JuiRightRailLoadingMore />;
  }

  onScroll = () => {};

  private _handleRetry = () => {};

  render() {
    const { totalCount, ids, firstLoaded } = this.props;
    const { subheader } = this._config;
    return (
      <JuiRightShelfContent>
        {firstLoaded && totalCount > 0 && ids.length > 0 && (
          <JuiListSubheader>
            {t(subheader)} ({this.props.totalCount})
          </JuiListSubheader>
        )}
        {firstLoaded && <JuiVirtualList dataSource={this} />}
        {!firstLoaded && this.firstLoader()}
      </JuiRightShelfContent>
    );
  }
}

export { ItemListView };
