/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-09 10:01:24
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { DataList } from '@/modules/common/container/DataList';
import { ViewProps, Props } from './types';
import { JuiListSubheader } from 'jui/components/Lists';
import { ThresholdStrategy } from 'jui/components/VirtualizedList';
import { JuiAutoSizer,Size } from 'jui/components/AutoSizer/AutoSizer';
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

  private _renderItems() {
    const { type, groupId, listHandler } = this.props;
    const tabConfig = getTabConfig(type);
    const Component: any = tabConfig.item;
    return listHandler.sortableListStore.getIds.map((itemId: number) => (
      <Component id={itemId} key={itemId} groupId={groupId} />
    ));
  }

  render() {
    const { type, listHandler, t } = this.props;
    const { size, total } = listHandler;
    const { subheader } = getTabConfig(type);

    return (
      <JuiRightShelfContent>
        {(total > 0 || size > 0) && (
          <JuiListSubheader data-test-automation-id="rightRail-list-subtitle">
            {t(subheader)}
          </JuiListSubheader>
        )}
        <JuiAutoSizer>
          {({ height }: Size) =>  (
              <DataList
                listHandler={listHandler}
                initialDataCount={INITIAL_DATA_COUNT}
                InfiniteListProps={Object.assign(this._infiniteListProps, {
                  height,
                  noRowsRenderer: <EmptyView type={type} />,
                })}
              >
                {this._renderItems()}
              </DataList>
            )}
        </JuiAutoSizer>
      </JuiRightShelfContent>
    );
  }
}

const ItemListView = withTranslation('translations')(ItemListComponent);

export { ItemListView };
