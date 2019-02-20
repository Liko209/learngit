/*
 * @Author: isaac.liu
 * @Date: 2019-02-02 13:53:40
 * Copyright © RingCentral. All rights reserved.
 */

import React, { CSSProperties } from 'react';
import { observer } from 'mobx-react';
import i18next from 'i18next';
import { PinnedListViewProps, PinnedListProps } from './types';
import { JuiListSubheader } from 'jui/components/Lists';

import {
  JuiVirtualList,
  IVirtualListDataSource,
  JuiVirtualCellWrapper,
  JuiVirtualCellOnLoadFunc,
} from 'jui/pattern/VirtualList';

import {
  JuiRightShelfContent,
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
} from 'jui/pattern/RightShelf';
import ReactResizeDetector from 'react-resize-detector';
import { PinnedCell } from './PinnedCell';
import { emptyView } from '../ItemList/Empty';
import { RIGHT_RAIL_ITEM_TYPE } from '../ItemList';

const HEADER_HEIGHT = 36;
@observer
class PinnedListView
  extends React.Component<PinnedListViewProps & PinnedListProps>
  implements IVirtualListDataSource {
  constructor(props: PinnedListViewProps & PinnedListProps) {
    super(props);
  }

  countOfCell() {
    const { totalCount } = this.props;
    return totalCount;
  }

  cellAtIndex = (
    index: number,
    style: CSSProperties,
    didLoad: JuiVirtualCellOnLoadFunc,
  ) => {
    const { ids } = this.props;
    const id = ids[index];
    let content;
    if (id) {
      content = <PinnedCell id={id} didLoad={didLoad} />;
    }

    return (
      <JuiVirtualCellWrapper key={id} style={style}>
        {content}
      </JuiVirtualCellWrapper>
    );
  }

  renderEmptyContent = () => {
    return emptyView(RIGHT_RAIL_ITEM_TYPE.PIN_POSTS);
  }

  isRowLoaded = (index: number) => {
    const { ids } = this.props;
    const result = typeof ids[index] !== 'undefined';
    return result;
  }

  loadMore = async () => {};

  firstLoader = () => {
    return <JuiRightRailContentLoading />;
  }

  moreLoader = () => {
    return <JuiRightRailLoadingMore />;
  }

  render() {
    const { totalCount, ids } = this.props;
    const firstLoaded = true;
    return (
      <JuiRightShelfContent>
        {firstLoaded && totalCount > 0 && ids.length > 0 && (
          <JuiListSubheader data-test-automation-id="rightRail-list-subtitle">
            {i18next.t('item.pinnedListSubheader')} ({totalCount})
          </JuiListSubheader>
        )}
        {firstLoaded && (
          <ReactResizeDetector handleWidth={true} handleHeight={true}>
            {(width: number = 0, height: number = HEADER_HEIGHT) => (
              <JuiVirtualList
                dataSource={this}
                threshold={1}
                isLoading={false}
                width={width}
                height={height - HEADER_HEIGHT}
              />
            )}
          </ReactResizeDetector>
        )}
      </JuiRightShelfContent>
    );
  }
}

export { PinnedListView };
