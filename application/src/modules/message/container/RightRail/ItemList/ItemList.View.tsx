/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ViewProps, Props } from './types';
import { JuiListSubheader } from 'jui/components/Lists';
import {
  JuiInfiniteList,
  ThresholdStrategy,
} from 'jui/components/VirtualizedList';
import { EmptyView } from './Empty';
import {
  JuiRightShelfContent,
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
} from 'jui/pattern/RightShelf';
import { getTabConfig } from './utils';
import {
  ITEM_HEIGHT,
  LOAD_MORE_STRATEGY_CONFIG,
  HEADER_HEIGHT,
} from '../constants';

type ItemListViewProps = Props & ViewProps & WithTranslation;

@observer
class ItemListComponent extends React.Component<ItemListViewProps> {
  private _loadMoreStrategy = new ThresholdStrategy(LOAD_MORE_STRATEGY_CONFIG);

  private _renderItems = () => {
    const { type, groupId } = this.props;
    const tabConfig = getTabConfig(type);
    const Component: any = tabConfig.item;
    return this.props.getIds.map((itemId: number) => (
      <Component id={itemId} key={itemId} groupId={groupId} />
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
    return <EmptyView type={type} />;
  }

  defaultLoading = () => {
    return <JuiRightRailContentLoading delay={500} />;
  }

  defaultLoadingMore = () => <JuiRightRailLoadingMore />;

  render() {
    const { type, height, size, total, t } = this.props;
    const { subheader } = getTabConfig(type);
    const h = Math.max(height - HEADER_HEIGHT, 0);
    return (
      <JuiRightShelfContent>
        {(total > 0 || size > 0) && (
          <JuiListSubheader data-test-automation-id="rightRail-list-subtitle">
            {t(subheader)}
          </JuiListSubheader>
        )}
        <JuiInfiniteList
          height={h}
          minRowHeight={ITEM_HEIGHT}
          loadInitialData={this.props.loadInitialData}
          loadMore={this.props.loadMore}
          loadMoreStrategy={this._loadMoreStrategy}
          loadingRenderer={this.defaultLoading()}
          hasMore={this.hasMore}
          loadingMoreRenderer={this.defaultLoadingMore()}
          noRowsRenderer={this.renderEmptyContent()}
          stickToLastPosition={false}
        >
          {this._renderItems()}
        </JuiInfiniteList>
      </JuiRightShelfContent>
    );
  }
}

const ItemListView = withTranslation('translations')(ItemListComponent);

export { ItemListView };
