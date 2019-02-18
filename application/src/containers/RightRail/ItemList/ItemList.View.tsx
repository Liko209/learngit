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
import { ITEM_HEIGHT } from './config';
import {
  JuiVirtualList,
  JuiVirtualCellWrapper,
  JuiVirtualCellProps,
} from 'jui/pattern/VirtualList';
import { emptyView } from './Empty';
import {
  JuiRightShelfContent,
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
} from 'jui/pattern/RightShelf';
import ReactResizeDetector from 'react-resize-detector';

const HEADER_HEIGHT = 36;

@observer
class ItemListView extends React.Component<ViewProps & Props> {
  rowRenderer = ({
    index,
    item: itemId,
    style,
  }: JuiVirtualCellProps<number>) => {
    const { tabConfig, active } = this.props;
    const Component: any = tabConfig.item;
    let content;
    if (itemId) {
      content = <Component id={itemId} />;
    }

    if (!active) return null;

    return (
      <JuiVirtualCellWrapper key={index} style={style}>
        {content}
      </JuiVirtualCellWrapper>
    );
  }

  noContentRenderer = () => {
    const { type } = this.props;
    return emptyView(type);
  }

  firstLoader = () => {
    return <JuiRightRailContentLoading />;
  }

  moreLoader = () => {
    return <JuiRightRailLoadingMore />;
  }

  render() {
    const { dataSource, groupId, tabConfig } = this.props;
    const { subheader } = tabConfig;
    const totalCount = dataSource.total();

    return (
      <JuiRightShelfContent>
        {dataSource.isLoadingContent() && this.firstLoader()}
        {!dataSource.isLoadingContent() &&
          totalCount > 0 &&
          dataSource.size() > 0 && (
            <JuiListSubheader data-test-automation-id="rightRail-list-subtitle">
              {i18next.t(subheader)} ({totalCount})
            </JuiListSubheader>
          )}
        {
          <ReactResizeDetector
            key={groupId}
            handleWidth={true}
            handleHeight={true}
          >
            {(width: number = 0, height: number = HEADER_HEIGHT) => {
              return (
                <JuiVirtualList
                  overscan={5}
                  threshold={40}
                  dataSource={dataSource}
                  rowRenderer={this.rowRenderer}
                  noContentRenderer={this.noContentRenderer}
                  moreLoader={this.moreLoader}
                  fixedCellHeight={ITEM_HEIGHT}
                  width={width}
                  height={height - HEADER_HEIGHT}
                />
              );
            }}
          </ReactResizeDetector>
        }
      </JuiRightShelfContent>
    );
  }
}

export { ItemListView };
