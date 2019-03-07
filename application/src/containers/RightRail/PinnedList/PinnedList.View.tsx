/*
 * @Author: isaac.liu
 * @Date: 2019-02-02 13:53:40
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import i18next from 'i18next';
import { PinnedListViewProps, PinnedListProps } from './types';
import { JuiListSubheader } from 'jui/components/Lists';

import {
  JuiVirtualList,
  IVirtualListDataSource,
  JuiVirtualCellProps,
} from 'jui/pattern/VirtualList';

import {
  JuiRightShelfContent,
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
} from 'jui/pattern/RightShelf';
import { PinnedCell } from './PinnedCell';
import { emptyView } from '../ItemList/Empty';
import { RIGHT_RAIL_ITEM_TYPE } from '../ItemList';

const HEADER_HEIGHT = 36;
@observer
class PinnedListView
  extends React.Component<PinnedListViewProps & PinnedListProps>
  implements IVirtualListDataSource<any, number> {
  constructor(props: PinnedListViewProps & PinnedListProps) {
    super(props);
  }

  size() {
    return this.props.ids.length;
  }

  get(index: number) {
    return this.props.ids[index];
  }

  total() {
    return this.props.totalCount;
  }

  rowRenderer = ({
    index,
    item: itemId,
    style,
  }: JuiVirtualCellProps<number>) => {
    let content;
    if (itemId) {
      content = <PinnedCell id={itemId} key={itemId} />;
    }

    return content;
  }

  renderEmptyContent = () => {
    return emptyView(RIGHT_RAIL_ITEM_TYPE.PIN_POSTS);
  }

  loadMore = async (startIndex: number, stopIndex: number) => {
    await this.props.loadMore(startIndex, stopIndex);
  }

  hasMore() {
    return this.size() !== this.props.totalCount;
  }

  firstLoader = () => {
    return <JuiRightRailContentLoading />;
  }

  moreLoader = () => {
    return <JuiRightRailLoadingMore />;
  }

  render() {
    const { totalCount, ids, width, height } = this.props;
    const firstLoaded = true;

    return (
      <JuiRightShelfContent>
        {firstLoaded && totalCount > 0 && ids.length > 0 && (
          <JuiListSubheader data-test-automation-id="rightRail-list-subtitle">
            {i18next.t('item.pinnedListSubheader')}
          </JuiListSubheader>
        )}
        {firstLoaded && (
          <JuiVirtualList
            dataSource={this}
            threshold={1}
            width={width}
            height={height - HEADER_HEIGHT}
            overscan={5}
            observeCell={true}
            rowRenderer={this.rowRenderer}
            noContentRenderer={this.renderEmptyContent}
            moreLoader={this.moreLoader}
          />
        )}
      </JuiRightShelfContent>
    );
  }
}

export { PinnedListView };
