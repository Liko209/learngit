/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import i18next from 'i18next';
import { ViewProps, Props } from './types';
import { JuiListSubheader } from 'jui/components/Lists';
import { JuiInfiniteList } from 'jui/components/VirtualizedList';
import { emptyView } from './Empty';
import {
  JuiRightShelfContent,
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
} from 'jui/pattern/RightShelf';
import { getTabConfig } from './utils';
import { ITEM_HEIGHT } from './config';

const HEADER_HEIGHT = 36;

@observer
class ItemListView extends React.Component<ViewProps & Props> {
  private _renderItems = () => {
    const { type } = this.props;
    const tabConfig = getTabConfig(type);
    const Component: any = tabConfig.item;
    return this.props.getIds.map((itemId: number) => (
      <Component id={itemId} key={itemId} />
    ));
  }

  hasMore = (direction: string) => {
    if (direction === 'up') {
      return false;
    }
    const { size, total } = this.props;
    return size !== total;
  }

  renderEmptyContent = () => {
    const { type } = this.props;
    return emptyView(type);
  }

  defaultLoading = () => {
    return <JuiRightRailContentLoading delay={500} />;
  }

  defaultLoadingMore = () => <JuiRightRailLoadingMore />;

  render() {
    const { type, height, size, total } = this.props;
    const { subheader } = getTabConfig(type);
    const h = Math.max(height - HEADER_HEIGHT, 0);
    return (
      <JuiRightShelfContent>
        {(total > 0 || size > 0) && (
          <JuiListSubheader data-test-automation-id="rightRail-list-subtitle">
            {i18next.t(subheader)}
          </JuiListSubheader>
        )}
        <JuiInfiniteList
          height={h}
          minRowHeight={ITEM_HEIGHT} // extract to const
          loadInitialData={this.props.loadInitialData}
          loadMore={this.props.loadMore}
          loadingRenderer={this.defaultLoading()}
          hasMore={this.hasMore}
          loadingMoreRenderer={this.defaultLoadingMore()}
          noRowsRenderer={this.renderEmptyContent()}
        >
          {this._renderItems()}
        </JuiInfiniteList>
      </JuiRightShelfContent>
    );
  }
}

export { ItemListView };
