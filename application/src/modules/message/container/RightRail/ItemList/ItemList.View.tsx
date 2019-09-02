/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { computed } from 'mobx';
import { observer, Observer } from 'mobx-react';
import { DataList } from '@/modules/common/container/DataList';
import { ViewProps, Props } from './types';
import { JuiListSubheader } from 'jui/components/Lists';
import { ThresholdStrategy } from 'jui/components/VirtualizedList';
import { JuiAutoSizer, Size } from 'jui/components/AutoSizer/AutoSizer';
import { withTranslation, WithTranslation } from 'react-i18next';
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
  INITIAL_DATA_COUNT,
  LOADING_DELAY,
} from '../constants';

type ItemListViewProps = Props & ViewProps & WithTranslation;

@observer
class ItemListComponent extends React.Component<ItemListViewProps> {
  private _infiniteListProps = {
    fixedRowHeight: ITEM_HEIGHT,
    loadMoreStrategy: new ThresholdStrategy(LOAD_MORE_STRATEGY_CONFIG),
    loadingRenderer: () => <JuiRightRailContentLoading delay={LOADING_DELAY} />,
    loadingMoreRenderer: () => <JuiRightRailLoadingMore />,
    stickToLastPosition: false,
  };

  @computed
  private get _emptyView() {
    return <EmptyView type={this.props.type} />;
  }

  @computed
  private get _dataReady() {
    const { size, total } = this.props.listHandler;
    return (total > 0 && total !== Infinity) || size > 0;
  }

  @computed
  private get _tabConfig() {
    return getTabConfig(this.props.type);
  }

  private _renderItems() {
    const { groupId, listHandler } = this.props;
    const Component: any = this._tabConfig.item;
    return listHandler.sortableListStore.getIds.map((itemId: number) => (
      <Component id={itemId} key={itemId} groupId={groupId} />
    ));
  }

  render() {
    const { listHandler, t } = this.props;
    return (
      <JuiRightShelfContent>
        {this._dataReady && (
          <JuiListSubheader data-test-automation-id="rightRail-list-subtitle">
            {t(this._tabConfig.subheader)}
          </JuiListSubheader>
        )}
        <JuiAutoSizer>
          {({ height }: Size) => (
            <Observer>
              {() => (
                <DataList
                  listHandler={listHandler}
                  initialDataCount={INITIAL_DATA_COUNT}
                  InfiniteListProps={Object.assign(this._infiniteListProps, {
                    height,
                    noRowsRenderer: this._emptyView,
                  })}
                >
                  {this._renderItems()}
                </DataList>
              )}
            </Observer>
          )}
        </JuiAutoSizer>
      </JuiRightShelfContent>
    );
  }
}

const ItemListView = withTranslation('translations')(ItemListComponent);

export { ItemListView };
